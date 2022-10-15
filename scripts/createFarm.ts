import { StakingProgram } from "../app/lib";
import * as anchor from "@project-serum/anchor";
import { Connection, PublicKey, sendAndConfirmTransaction, Signer, Transaction, TransactionInstruction } from "@solana/web3.js";
import { findFarmAddress } from "../app/lib/pda";
import { withParsedError } from "../app/lib/utils";

export const send = (
  connection: Connection,
  ixs: TransactionInstruction[],
  signers: Signer[]
) => {
  const tx = new Transaction().add(...ixs);

  return withParsedError(sendAndConfirmTransaction)(connection, tx, signers);
};

const createFarm = async () => {
  const connection = new anchor.web3.Connection('http://127.0.0.1:8899', 'confirmed')

  const farmAuthority = anchor.web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse('KEYPAIR')))

  const rewardMint = new PublicKey('3NJkKdb39vWEo931SomFB1ds9wZmCGh1dT3ddGeF6oEQ')

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

  console.log(JSON.stringify(farm))
}

createFarm()