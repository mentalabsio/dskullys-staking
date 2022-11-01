import { web3, BN } from "@project-serum/anchor"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Transaction } from "@solana/web3.js"
import { useCallback, useEffect, useState } from "react"

import { StakingProgram } from "lib"
import { Farmer, StakeReceipt } from "lib/gen/accounts"
import { findFarmAddress, findFarmerAddress } from "lib/pda"
import { findUserStakeReceipts } from "lib/utils"
import { getNFTMetadata } from "utils/nfts"
import { NFT } from "./useWalletNFTs"
import toast from 'react-hot-toast'

const farmAuthorityPubKey = new web3.PublicKey(
  "Eqbyn7MKgdFGtPcWwMq92X5t1RdYCGgi5mkPA66vJAQE"
)

const rewardMint = new web3.PublicKey(
  "CQn58YtdP7K1F2jpraozow9BrHhHHgiK6kgVNCpUbG5e"
)

export type StakeReceiptWithMetadata = StakeReceipt & {
  metadata: NFT
}

const useStaking = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, signAllTransactions } = useWallet()
  const [farmerAccount, setFarmerAccount] = useState<Farmer | null>(null)

  const [stakeReceipts, setStakeReceipts] = useState<
    StakeReceiptWithMetadata[] | null
  >(null)

  /**
   * Fetch all stake receipts
   */
  const fetchReceipts = useCallback(async () => {
    if (publicKey) {
      try {
        const farm = findFarmAddress({
          authority: farmAuthorityPubKey,
          rewardMint,
        })

        toast("Fetching receipts...")
        const receipts = await findUserStakeReceipts(
          connection,
          farm,
          publicKey
        )

        const stakingReceipts = receipts.filter(
          (receipt) => receipt.endTs === null
        )

        toast("Fetching metadata...")
        const withMetadatas = await Promise.all(
          stakingReceipts.map(async (receipt) => {
            const metadata = await getNFTMetadata(
              receipt.mint.toString(),
              connection
            )

            const withMetadata = Object.assign(receipt, { metadata })

            return withMetadata
          })
        )

        setStakeReceipts(withMetadatas)
      } catch (e) {
        toast(
          "Something went wrong. " + (e.message ? e.message : e)
        )
      }
    }
  }, [publicKey])

  /**
   * Fetch farmer account
   */
  const fetchFarmer = useCallback(async () => {
    try {
      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })

      const farmer = findFarmerAddress({ farm, owner: publicKey })

      toast("Fetching farmer...")
      const farmerAccountData = await Farmer.fetch(connection, farmer)

      if (!farmerAccountData) {
        setFarmerAccount(null)

        return true
      }

      setFarmerAccount(farmerAccountData)
    } catch (e) {
      toast("Something went wrong. " + (e.message ? e.message : e))
    }
  }, [publicKey])

  useEffect(() => {
    if (publicKey) {
      fetchFarmer()
      fetchReceipts()
    }
  }, [publicKey])

  const initFarmer = async () => {
    try {
      const stakingClient = StakingProgram(connection)

      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })

      toast("Initializing transaction...")
      const { ix } = await stakingClient.createInitializeFarmerInstruction({
        farm,
        owner: publicKey,
      })

      const latest = await connection.getLatestBlockhash()
      const tx = new Transaction()

      tx.recentBlockhash = latest.blockhash
      tx.add(ix)

      tx.feePayer = publicKey

      toast("Awaiting approval...")
      const txid = await sendTransaction(tx, connection)

      await connection.confirmTransaction(txid)

      toast("Success!")

      await fetchFarmer()
    } catch (e) {
      toast("Something went wrong. " + (e.message ? e.message : e))
    }
  }

  const stakeSelected = async (mints: web3.PublicKey[]) => {
    try {
      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })

      toast("Initializing...")

      const stakingClient = StakingProgram(connection)

      let additionals = []
      const ixs = await Promise.all(
        mints.map(async (mint) => {
          const { ix } = await stakingClient.createStakeInstruction({
            farm,
            mint,
            owner: publicKey,
            amount: new BN(1),
          })

          return ix
        })
      )

      const txs: Transaction[] = []

      const latest = await connection.getLatestBlockhash()

      ixs.map((ixs) => {
        const tx = new Transaction()
        tx.recentBlockhash = latest.blockhash
        tx.feePayer = publicKey
        tx.add(ixs)
        txs.push(tx)
      })

      toast("Awaiting approval...")

      const signedTxs = await signAllTransactions(txs)

      const txids = await Promise.all(
        signedTxs.map(async (signed) => {
          return await connection.sendRawTransaction(signed.serialize())
        })
      )

      toast("Confirming...")
      await Promise.all(
        txids.map(async (txid) => {
          return await connection.confirmTransaction(txid, "confirmed")
        })
      )
    } catch (e) {
      toast("Something went wrong. " + (e.message ? e.message : e))
    }
  }

  const unstakeAll = async (mints: web3.PublicKey[]) => {
    try {
      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })

      const stakingClient = StakingProgram(connection)

      toast("Initializing...")

      const ixs = await Promise.all(
        mints.map(async (mint) => {
          const { ix } = await stakingClient.createUnstakeInstruction({
            farm,
            mint,
            owner: publicKey,
          })

          return ix
        })
      )

      const txs: Transaction[] = []

      const latest = await connection.getLatestBlockhash()

      ixs.map((ixs) => {
        const tx = new Transaction()
        tx.recentBlockhash = latest.blockhash
        tx.feePayer = publicKey
        tx.add(ixs)
        txs.push(tx)
      })

      toast("Awaiting approval...")

      const signedTxs = await signAllTransactions(txs)

      const txids = await Promise.all(
        signedTxs.map(async (signed) => {
          return await connection.sendRawTransaction(signed.serialize())
        })
      )

      toast("Confirming...")
      await Promise.all(
        txids.map(async (txid) => {
          return await connection.confirmTransaction(txid, "confirmed")
        })
      )
    } catch (e) {
      toast("Something went wrong. " + (e.message ? e.message : e))
    }
  }

  const claim = async () => {
    try {
      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })

      const stakingClient = StakingProgram(connection)

      const { ix } = await stakingClient.createClaimRewardsInstruction({
        farm,
        authority: publicKey,
      })

      const latest = await connection.getLatestBlockhash("confirmed")
      const tx = new Transaction()

      tx.add(ix)
      tx.recentBlockhash = latest.blockhash
      tx.feePayer = publicKey

      toast("Awaiting approval...")

      const txid = await sendTransaction(tx, connection)

      toast("Confirming...")

      await connection.confirmTransaction(txid)

      toast("Success!")
    } catch (e) {
      toast("Something went wrong. " + (e.message ? e.message : e))
    }
  }

  return {
    farmerAccount,
    claim,
    initFarmer,
    stakeSelected,
    unstakeAll,
    stakeReceipts,
    fetchReceipts,
  }
}

export default useStaking
