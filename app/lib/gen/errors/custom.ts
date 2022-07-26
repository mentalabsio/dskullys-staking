export type CustomError =
  | CooldownIsNotOver
  | CouldNotReserveReward
  | CouldNotReleaseReward
  | GemStillLocked
  | GemStillStaked
  | GemNotStaked
  | InvalidWhitelistType
  | FactorMustBeGtZero
  | ArithmeticError

export class CooldownIsNotOver extends Error {
  static readonly code = 6000
  readonly code = 6000
  readonly name = "CooldownIsNotOver"
  readonly msg = "Cooldown is not over yet."

  constructor(readonly logs?: string[]) {
    super("6000: Cooldown is not over yet.")
  }
}

export class CouldNotReserveReward extends Error {
  static readonly code = 6001
  readonly code = 6001
  readonly name = "CouldNotReserveReward"
  readonly msg = "Insufficient reward funds. Could not reserve."

  constructor(readonly logs?: string[]) {
    super("6001: Insufficient reward funds. Could not reserve.")
  }
}

export class CouldNotReleaseReward extends Error {
  static readonly code = 6002
  readonly code = 6002
  readonly name = "CouldNotReleaseReward"
  readonly msg = "Insufficient reserved reward. Could not release."

  constructor(readonly logs?: string[]) {
    super("6002: Insufficient reserved reward. Could not release.")
  }
}

export class GemStillLocked extends Error {
  static readonly code = 6003
  readonly code = 6003
  readonly name = "GemStillLocked"
  readonly msg = "Cannot unstake while the gem is still locked."

  constructor(readonly logs?: string[]) {
    super("6003: Cannot unstake while the gem is still locked.")
  }
}

export class GemStillStaked extends Error {
  static readonly code = 6004
  readonly code = 6004
  readonly name = "GemStillStaked"
  readonly msg = "Must unstake before staking again."

  constructor(readonly logs?: string[]) {
    super("6004: Must unstake before staking again.")
  }
}

export class GemNotStaked extends Error {
  static readonly code = 6005
  readonly code = 6005
  readonly name = "GemNotStaked"
  readonly msg = "Attempt to operate on a gem that is no longer staked."

  constructor(readonly logs?: string[]) {
    super("6005: Attempt to operate on a gem that is no longer staked.")
  }
}

export class InvalidWhitelistType extends Error {
  static readonly code = 6006
  readonly code = 6006
  readonly name = "InvalidWhitelistType"
  readonly msg = "Invalid whitelist type."

  constructor(readonly logs?: string[]) {
    super("6006: Invalid whitelist type.")
  }
}

export class FactorMustBeGtZero extends Error {
  static readonly code = 6007
  readonly code = 6007
  readonly name = "FactorMustBeGtZero"
  readonly msg = "Buff factor must be greater than 0."

  constructor(readonly logs?: string[]) {
    super("6007: Buff factor must be greater than 0.")
  }
}

export class ArithmeticError extends Error {
  static readonly code = 6008
  readonly code = 6008
  readonly name = "ArithmeticError"
  readonly msg = "An arithmetic error occurred."

  constructor(readonly logs?: string[]) {
    super("6008: An arithmetic error occurred.")
  }
}

export function fromCode(code: number, logs?: string[]): CustomError | null {
  switch (code) {
    case 6000:
      return new CooldownIsNotOver(logs)
    case 6001:
      return new CouldNotReserveReward(logs)
    case 6002:
      return new CouldNotReleaseReward(logs)
    case 6003:
      return new GemStillLocked(logs)
    case 6004:
      return new GemStillStaked(logs)
    case 6005:
      return new GemNotStaked(logs)
    case 6006:
      return new InvalidWhitelistType(logs)
    case 6007:
      return new FactorMustBeGtZero(logs)
    case 6008:
      return new ArithmeticError(logs)
  }

  return null
}
