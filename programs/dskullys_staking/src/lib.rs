use anchor_lang::prelude::*;

declare_id!("AN21jidmj4MKC5Qm4GJqEDr5NswDBeZaPWuyaSwX2tcj");

pub mod error;
pub mod instructions;
pub mod state;
pub(crate) mod utils;

use instructions::*;
use state::*;

#[program]
pub mod dskullys_staking {
    use super::*;

    pub fn create_farm(ctx: Context<CreateFarm>) -> Result<()> {
        instructions::create_farm::handler(ctx)
    }

    pub fn add_manager(ctx: Context<AddManager>) -> Result<()> {
        instructions::add_manager::handler(ctx)
    }

    pub fn add_to_whitelist(
        ctx: Context<AddToWhitelist>,
        reward_rate: u64,
        whitelist_type: WhitelistType,
    ) -> Result<()> {
        instructions::add_to_whitelist::handler(
            ctx,
            reward_rate,
            whitelist_type,
        )
    }

    pub fn remove_from_whitelist(
        ctx: Context<RemoveFromWhitelist>,
    ) -> Result<()> {
        instructions::remove_from_whitelist::handler(ctx)
    }

    pub fn fund_reward(ctx: Context<FundReward>, amount: u64) -> Result<()> {
        instructions::fund_reward::handler(ctx, amount)
    }

    pub fn initialize_farmer(ctx: Context<InitializeFarmer>) -> Result<()> {
        instructions::initialize_farmer::handler(ctx)
    }

    pub fn stake<'info>(
        ctx: Context<'_, '_, '_, 'info, Stake<'info>>,
        amount: u64,
    ) -> Result<()> {
        instructions::stake::handler(ctx, amount)
    }

    pub fn unstake<'info>(
        ctx: Context<'_, '_, '_, 'info, Unstake<'info>>,
    ) -> Result<()> {
        instructions::unstake::handler(ctx)
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        instructions::claim_rewards::handler(ctx)
    }
}
