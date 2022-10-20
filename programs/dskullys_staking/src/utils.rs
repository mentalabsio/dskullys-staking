#![allow(dead_code)]
use anchor_lang::{prelude::*, system_program};
use anchor_spl::token::{self, TokenAccount};
use solutils::wrappers::metadata::MetadataAccount;

use crate::error::StakingError;

pub fn initialize_pda<'info>(
    seeds: &[&[u8]],
    space: usize,
    owner: &Pubkey,
    account: AccountInfo<'info>,
    payer: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
) -> Result<()> {
    let rent = Rent::get()?.minimum_balance(space);

    let cpi_accounts = system_program::CreateAccount {
        from: payer,
        to: account,
    };

    let cpi_ctx = CpiContext::new(system_program, cpi_accounts);

    system_program::create_account(
        cpi_ctx.with_signer(&[seeds]),
        rent,
        space as u64,
        owner,
    )
}

pub fn close_ata<'info>(
    account: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    destination: AccountInfo<'info>,
    program: AccountInfo<'info>,
    seeds: Option<&[&[u8]]>,
) -> Result<()> {
    let token_account: Account<TokenAccount> = Account::try_from(&account)?;

    if token_account.amount != 0 {
        return Ok(());
    }

    let cpi_accounts = token::CloseAccount {
        destination,
        authority,
        account,
    };

    let ctx = CpiContext::new(program, cpi_accounts);

    if let Some(seeds) = seeds {
        return token::close_account(ctx.with_signer(&[seeds]));
    }

    token::close_account(ctx)
}

pub fn transfer_spl_ctx<'a, 'b, 'c, 'info>(
    from: AccountInfo<'info>,
    to: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
) -> CpiContext<'a, 'b, 'c, 'info, token::Transfer<'info>> {
    CpiContext::new(
        token_program,
        token::Transfer {
            from,
            to,
            authority,
        },
    )
}

pub fn calculate_reward_rate(base: u64, factor: u64) -> Result<u64> {
    if factor == 0 {
        return Ok(base);
    }

    // (factor + 100) * base / 100;
    factor
        .checked_add(100)
        .ok_or(StakingError::ArithmeticError)?
        .checked_mul(base)
        .ok_or(StakingError::ArithmeticError)?
        .checked_div(100)
        .ok_or(StakingError::ArithmeticError)
        .map_err(Into::into)
}

pub fn metadata_creator(metadata: &MetadataAccount) -> Result<Pubkey> {
    Ok(metadata
        .data
        .creators
        .as_ref()
        .ok_or(ProgramError::InvalidAccountData)?
        .get(0)
        .and_then(|creator| {
            if creator.verified {
                Some(creator.address)
            } else {
                None
            }
        })
        .ok_or(ProgramError::InvalidAccountData)?)
}

pub fn now_ts() -> Result<u64> {
    Clock::get()
        .map(|c| c.unix_timestamp as u64)
        .map_err(Into::into)
}
