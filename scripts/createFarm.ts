import { StakingProgram } from "../app/lib";
import * as anchor from "@project-serum/anchor";
import { Connection, PublicKey, sendAndConfirmTransaction, Signer, Transaction, TransactionInstruction } from "@solana/web3.js";
import { findFarmAddress } from "../app/lib/pda";
import { withParsedError } from "../app/lib/utils";

const send = (
  connection: Connection,
  ixs: TransactionInstruction[],
  signers: Signer[]
) => {
  const tx = new Transaction().add(...ixs);

  return withParsedError(sendAndConfirmTransaction)(connection, tx, signers);
};

const createFarm = async () => {
  const connection = new anchor.web3.Connection('http://127.0.0.1:8899', 'confirmed')

  const farmAuthority = anchor.web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse('[159,169,117,176,7,86,18,232,43,218,167,171,209,102,61,117,241,224,249,108,70,116,48,230,155,224,25,253,37,188,85,216,102,104,90,88,254,145,234,6,244,46,158,161,230,196,151,45,211,134,110,18,180,9,0,118,22,57,179,37,143,208,147,69]')))

  const rewardMint = new PublicKey('5szfhmCRzvGZWjANJjbnhgEQSzoyFheQQBDPCJ2ZfbC2')

  const stakingClient = StakingProgram(connection);
  const { ix } = await stakingClient.createFarmInstruction({
    authority: farmAuthority.publicKey,
    rewardMint,
  });

  await send(connection, ix, [farmAuthority]);

  const farm = findFarmAddress({
    authority: farmAuthority.publicKey,
    rewardMint,
  });

  console.log(new PublicKey(farm))
}

createFarm()