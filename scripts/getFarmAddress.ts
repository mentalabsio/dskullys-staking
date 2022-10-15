import { PublicKey } from "@solana/web3.js"
import { findFarmAddress } from "../app/lib/pda"

const getFarmAddress = async () => {
  const rewardMint = new PublicKey('FUGwDrBaPetAdeGq1VZDcT9sxAWCMmeqFwyr4qu4jg4m')
  const farm = findFarmAddress({
    authority: new PublicKey('9NcCHbUH5Me7nDb8G8ULEaEtQZdRY3oS23CFgdkK1sjT'),
    rewardMint
  })

  console.log((JSON.stringify(farm)))
}

getFarmAddress()