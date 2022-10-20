#!/usr/bin/env -S npx ts-node
import { StakingProgram } from "../app/lib";
import * as anchor from "@project-serum/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Signer,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { readFileSync } from "fs";
import { withParsedError } from "../app/lib/utils";
import { Farmer } from "../app/lib/gen/accounts";

const FARM_AUTHORITY = "auth.json";

const forceUnstake = async () => {
  const connection = new anchor.web3.Connection(
    "https://ssc-dao.genesysgo.net/"
  );

  const program = StakingProgram(connection);
  const farmAuthority = Keypair.fromSecretKey(readFileSync(FARM_AUTHORITY));

  const acc = await connection.getAccountInfo(
    new PublicKey("2s2rndVcs7cCakzjCas8RJV8k5P621aK6cWJpNJsgg6U")
  );

  const { farm, owner } = Farmer.decode(acc.data);

  const { ix } = await program.createForceUnstakeInstruction({
    farm,
    mint: new PublicKey("4vrkScGkCP8KjNu6RpzgR8zyHJXWWyUz5SMHJrSzNHUt"),
    owner,
    farmAuthority: farmAuthority.publicKey,
  });

  await send(connection, [ix], [farmAuthority]);
};

const send = (
  connection: Connection,
  ixs: TransactionInstruction[],
  signers: Signer[]
) => {
  const tx = new Transaction().add(...ixs);
  return withParsedError(sendAndConfirmTransaction)(connection, tx, signers);
};

forceUnstake();
