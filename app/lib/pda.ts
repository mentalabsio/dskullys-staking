import { utils } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

import { PROGRAM_ID } from "./gen/programId";

export const findFarmAddress = ({
  authority,
  rewardMint,
}: {
  authority: PublicKey;
  rewardMint: PublicKey;
}): PublicKey =>
  utils.publicKey.findProgramAddressSync(
    [Buffer.from("farm"), authority.toBuffer(), rewardMint.toBuffer()],
    PROGRAM_ID
  )[0];

export const findFarmerAddress = ({
  farm,
  owner,
}: {
  farm: PublicKey;
  owner: PublicKey;
}): PublicKey =>
  utils.publicKey.findProgramAddressSync(
    [Buffer.from("farmer"), farm.toBuffer(), owner.toBuffer()],
    PROGRAM_ID
  )[0];

export const findFarmManagerAddress = ({
  farm,
  authority,
}: {
  farm: PublicKey;
  authority: PublicKey;
}): PublicKey =>
  utils.publicKey.findProgramAddressSync(
    [Buffer.from("farm_manager"), farm.toBuffer(), authority.toBuffer()],
    PROGRAM_ID
  )[0];

export const findWhitelistProofAddress = ({
  farm,
  creatorOrMint,
}: {
  farm: PublicKey;
  creatorOrMint: PublicKey;
}): PublicKey =>
  utils.publicKey.findProgramAddressSync(
    [Buffer.from("collection_data"), farm.toBuffer(), creatorOrMint.toBuffer()],
    PROGRAM_ID
  )[0];

export const findStakeReceiptAddress = ({
  farmer,
  mint,
}: {
  farmer: PublicKey;
  mint: PublicKey;
}): PublicKey =>
  utils.publicKey.findProgramAddressSync(
    [Buffer.from("stake_receipt"), farmer.toBuffer(), mint.toBuffer()],
    PROGRAM_ID
  )[0];
