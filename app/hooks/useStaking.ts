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
      const toastId = toast.loading("Fetching receipts...")
      try {
        const farm = findFarmAddress({
          authority: farmAuthorityPubKey,
          rewardMint,
        })

        const receipts = await findUserStakeReceipts(
          connection,
          farm,
          publicKey
        )

        const stakingReceipts = receipts.filter(
          (receipt) => receipt.endTs === null
        )

        toast.loading("Fetching metadata...", {
          id: toastId
        })
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

        toast.success("Success!", {
          id: toastId
        })
      } catch (e) {
        toast.error(
          "Something went wrong. " + (e.message ? e.message : e), {
          id: toastId
        }
        )
      }
    } else {
      setStakeReceipts([])
    }
  }, [publicKey])

  /**
   * Fetch farmer account
   */
  const fetchFarmer = useCallback(async () => {
    if (publicKey) {
      const toastId = toast.loading("Fetching farmer...")
      try {
        const farm = findFarmAddress({
          authority: farmAuthorityPubKey,
          rewardMint,
        })

        const farmer = findFarmerAddress({ farm, owner: publicKey })

        const farmerAccountData = await Farmer.fetch(connection, farmer)

        if (!farmerAccountData) {
          setFarmerAccount(null)
          toast.success("Farmer account not found. Please register as staker.", {
            id: toastId
          })
          return true
        }

        setFarmerAccount(farmerAccountData)

        toast.success("Success!", {
          id: toastId
        })
      } catch (e) {
        toast.error("Something went wrong. " + (e.message ? e.message : e), {
          id: toastId
        })
      }
    } else {
      setFarmerAccount(null)
    }
  }, [publicKey])

  useEffect(() => {
    fetchFarmer()
    fetchReceipts()
  }, [publicKey])

  useEffect(() => {
    if (publicKey) {
      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })

      const farmer = findFarmerAddress({ farm, owner: publicKey })

      connection.onAccountChange(farmer, () => {
        fetchFarmer()
      }, 'confirmed')
    }
  }, [publicKey, connection, fetchFarmer])

  const initFarmer = async () => {
    const toastId = toast.loading("Initializing transaction...")

    try {
      const stakingClient = StakingProgram(connection)

      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })

      const { ix } = await stakingClient.createInitializeFarmerInstruction({
        farm,
        owner: publicKey,
      })

      const latest = await connection.getLatestBlockhash()
      const tx = new Transaction()

      tx.recentBlockhash = latest.blockhash
      tx.add(ix)

      tx.feePayer = publicKey

      toast.loading("Awaiting approval...", {
        id: toastId
      })
      const txid = await sendTransaction(tx, connection)

      await connection.confirmTransaction(txid)

      toast.success("Success!", {
        id: toastId
      })

      await fetchFarmer()
    } catch (e) {
      toast.error("Something went wrong. " + (e.message ? e.message : e), {
        id: toastId
      })
    }
  }

  const stakeSelected = async (mints: web3.PublicKey[]) => {
    const toastId = toast.loading("Initializing...")

    try {
      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })


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

      toast.loading("Awaiting approval...", {
        id: toastId
      })

      const signedTxs = await signAllTransactions(txs)

      const txids = await Promise.all(
        signedTxs.map(async (signed) => {
          return await connection.sendRawTransaction(signed.serialize())
        })
      )

      toast.loading("Confirming...", {
        id: toastId
      })
      await Promise.all(
        txids.map(async (txid) => {
          return await connection.confirmTransaction(txid, "confirmed")
        })
      )
      toast.success("Success!", {
        id: toastId
      })
    } catch (e) {
      toast.error("Something went wrong. " + (e.message ? e.message : e), {
        id: toastId
      })
    }
  }

  const unstakeAll = async (mints: web3.PublicKey[]) => {
    const toastId = toast.loading("Initializing...")

    try {
      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })

      const stakingClient = StakingProgram(connection)


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

      toast.loading("Awaiting approval...", {
        id: toastId
      })

      const signedTxs = await signAllTransactions(txs)

      const txids = await Promise.all(
        signedTxs.map(async (signed) => {
          return await connection.sendRawTransaction(signed.serialize())
        })
      )

      toast.loading("Confirming...", {
        id: toastId
      })
      await Promise.all(
        txids.map(async (txid) => {
          return await connection.confirmTransaction(txid, "confirmed")
        })
      )

      toast.success("Success!", {
        id: toastId
      })
    } catch (e) {
      toast.error("Something went wrong. " + (e.message ? e.message : e), {
        id: toastId
      })
    }
  }

  const claim = async () => {
    const toastId = toast.loading("Initializing...")

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

      toast.loading("Awaiting approval...", {
        id: toastId
      })

      const txid = await sendTransaction(tx, connection)

      toast.loading("Confirming...", {
        id: toastId
      })

      await connection.confirmTransaction(txid)

      toast.success("Success!", {
        id: toastId
      })
    } catch (e) {
      toast.error("Something went wrong. " + (e.message ? e.message : e), {
        id: toastId
      })
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
