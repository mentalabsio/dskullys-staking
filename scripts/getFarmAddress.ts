import { web3 } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"
import { findFarmAddress } from "../app/lib/pda"

const getFarmAddress = async () => {
  const farmAuthority = web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse('KEYPAIR')))
  const rewardMint = new PublicKey('5szfhmCRzvGZWjANJjbnhgEQSzoyFheQQBDPCJ2ZfbC2')
  const farm = findFarmAddress({
    authority: farmAuthority.publicKey,
    rewardMint
  })

  console.log((JSON.stringify(farm)))
}

getFarmAddress()