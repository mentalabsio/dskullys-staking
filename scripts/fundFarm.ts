import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { StakingProgram } from "../app/lib";
import { Farm } from "../app/lib/gen/accounts";
import { findFarmAddress } from "../app/lib/pda";
import { send } from "./createFarm";

const fundFarm = async () => {

  const connection = new Connection('https://devnet.genesysgo.net/', 'confirmed')

  const stakingClient = StakingProgram(connection);

  const farmAuthority = Keypair.fromSecretKey(new Uint8Array(JSON.parse('KEYPAIR')))

  const rewardMint = new PublicKey('FUGwDrBaPetAdeGq1VZDcT9sxAWCMmeqFwyr4qu4jg4m')
    const farm = findFarmAddress({
      authority: farmAuthority.publicKey,
      rewardMint: rewardMint,
    });
  
    const { ix } = await stakingClient.createFundRewardInstruction({
      farm,
      authority: farmAuthority.publicKey,
      amount: new BN(1000e9),
    });
  
    await send(connection, [ix], [farmAuthority]);
  
    const farmAccount = await Farm.fetch(connection, farm);
  
    console.log(farmAccount.reward.available.toNumber())
    console.log(farmAccount.reward.reserved.toNumber())
}

fundFarm()