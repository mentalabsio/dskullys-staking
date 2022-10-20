import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface ForceUnstakeAccounts {
  farm: PublicKey
  farmer: PublicKey
  gemMint: PublicKey
  stakeReceipt: PublicKey
  farmerVault: PublicKey
  gemOwnerAta: PublicKey
  owner: PublicKey
  authority: PublicKey
  rent: PublicKey
  systemProgram: PublicKey
  tokenProgram: PublicKey
  associatedTokenProgram: PublicKey
}

export function forceUnstake(accounts: ForceUnstakeAccounts) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.farm, isSigner: false, isWritable: true },
    { pubkey: accounts.farmer, isSigner: false, isWritable: true },
    { pubkey: accounts.gemMint, isSigner: false, isWritable: false },
    { pubkey: accounts.stakeReceipt, isSigner: false, isWritable: true },
    { pubkey: accounts.farmerVault, isSigner: false, isWritable: true },
    { pubkey: accounts.gemOwnerAta, isSigner: false, isWritable: true },
    { pubkey: accounts.owner, isSigner: false, isWritable: false },
    { pubkey: accounts.authority, isSigner: true, isWritable: true },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    {
      pubkey: accounts.associatedTokenProgram,
      isSigner: false,
      isWritable: false,
    },
  ]
  const identifier = Buffer.from([62, 187, 167, 168, 85, 151, 117, 4])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
