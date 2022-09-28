import * as WhitelistType from "./WhitelistType"

export { Reward } from "./Reward"
export type { RewardFields, RewardJSON } from "./Reward"
export { WhitelistType }

export type WhitelistTypeKind = WhitelistType.Creator | WhitelistType.Mint
export type WhitelistTypeJSON =
  | WhitelistType.CreatorJSON
  | WhitelistType.MintJSON
