use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

declare_id!("DkMt4VqQvgeivRjqpL3bQrwfRgKX4n1xRGCbF2acfSpC");

pub mod error;
pub mod instructions;
pub mod state;
pub(crate) mod utils;

use instructions::*;
use state::*;
use utils::close_ata;

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
        has_essence: bool,
    ) -> Result<()> {
        instructions::stake::handler(ctx, amount, has_essence)
    }

    pub fn unstake<'info>(
        ctx: Context<'_, '_, '_, 'info, Unstake<'info>>,
    ) -> Result<()> {
        instructions::unstake::handler(ctx)
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        instructions::claim_rewards::handler(ctx)
    }

    pub fn force_unstake(ctx: Context<ForceUnstake>) -> Result<()> {
        let cpi_ctx = utils::transfer_spl_ctx(
            ctx.accounts.farmer_vault.to_account_info(),
            ctx.accounts.gem_owner_ata.to_account_info(),
            ctx.accounts.farmer.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
        );

        anchor_spl::token::transfer(
            cpi_ctx.with_signer(&[&ctx.accounts.farmer.seeds()]),
            1,
        )?;

        close_ata(
            ctx.accounts.farmer_vault.to_account_info(),
            ctx.accounts.farmer.to_account_info(),
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            Some(&ctx.accounts.farmer.seeds()),
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct ForceUnstake<'info> {
    #[account(mut)]
    pub farm: Account<'info, Farm>,

    #[account(
        mut,
        has_one = farm,
        has_one = owner,
        seeds = [
            Farmer::PREFIX,
            farm.key().as_ref(),
            owner.key().as_ref()
        ],
        bump,
    )]
    pub farmer: Account<'info, Farmer>,

    #[account(address = stake_receipt.mint)]
    pub gem_mint: Account<'info, Mint>,

    #[account(
        mut,
        has_one = farmer,
        seeds = [
            StakeReceipt::PREFIX,
            farmer.key().as_ref(),
            gem_mint.key().as_ref(),
        ],
        bump,
    )]
    pub stake_receipt: Account<'info, StakeReceipt>,

    #[account(
        mut,
        associated_token::mint = gem_mint,
        associated_token::authority = farmer,
    )]
    pub farmer_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = gem_mint,
        associated_token::authority = owner,
    )]
    pub gem_owner_ata: Box<Account<'info, TokenAccount>>,

    pub owner: SystemAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
