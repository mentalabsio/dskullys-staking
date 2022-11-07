import { useConnection } from "@solana/wallet-adapter-react"
import { StakeReceipt } from "lib/gen/accounts"
import { findAllStakeReceipts } from "lib/utils"
import { useCallback, useEffect, useState } from "react"

export const useTotalStaked = () => {
  const { connection } = useConnection()
  const [allStakeReceipts, setAllStakeReceipts] = useState<StakeReceipt[]>(null)

  const fetchAllStakeReceipts = useCallback(async () => {
    if (!allStakeReceipts) {
      try {
        const receipts = await findAllStakeReceipts(connection)

        const stakingReceipts = receipts.filter(
          (receipt) => receipt.endTs === null
        )

        setAllStakeReceipts(stakingReceipts)
      } catch (e) { }
    }
  }, [])

  useEffect(() => {
    fetchAllStakeReceipts()
  }, [fetchAllStakeReceipts])

  const totalStaked = allStakeReceipts?.length

  const totalRewardsEmission = allStakeReceipts?.reduce((prev, receipt) => {
    return prev + receipt.rewardRate.toNumber()
  }, 0)

  const averageStakedAmount = allStakeReceipts?.reduce((prev, current) => {
    return prev + current.amount.toNumber()
  }, 0) / allStakeReceipts?.length

  return { totalStaked, totalRewardsEmission, averageStakedAmount }
}