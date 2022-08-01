use std::{fmt::Display, io::Write};

use anchor_client::solana_sdk::pubkey::Pubkey;
use anyhow::Result;
use magicshards_staking::state::{Farm, FarmManager, WhitelistProof, WhitelistType};

pub(crate) struct OutputOptions {
    writer: Box<dyn Write>,
}

impl Default for OutputOptions {
    fn default() -> Self {
        Self {
            writer: Box::new(std::io::stdout()),
        }
    }
}

pub(crate) trait Output: Display {}

pub(crate) fn output_command<T: Output>(output: T, mut options: OutputOptions) -> Result<()> {
    writeln!(options.writer, "{}", output)?;
    Ok(())
}

pub(crate) struct WhitelistListOutput(pub Vec<(Pubkey, WhitelistProof)>);
pub(crate) struct FarmListOutput(pub Vec<(Pubkey, Farm)>);
pub(crate) struct FarmManagerListOutput(pub Vec<(Pubkey, FarmManager)>);

impl Output for WhitelistListOutput {}
impl Display for WhitelistListOutput {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(
            f,
            "{:^44} | {:^22} | {:^22}",
            "Address", "Reward rate", "Type"
        )?;
        for (k, wl) in &self.0 {
            writeln!(
                f,
                "{:^44} | {:^22} | {:^22}",
                k,
                wl.reward_rate,
                match wl.ty {
                    WhitelistType::Creator => "Creator",
                    WhitelistType::Mint => "Mint",
                }
            )?;
        }
        Ok(())
    }
}

impl Output for FarmListOutput {}
impl Display for FarmListOutput {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "{:^44} | {:^44}", "Address", "Reward mint")?;
        for (k, farm) in &self.0 {
            writeln!(f, "{:^44} | {:^44}", k, farm.reward.mint)?;
        }
        Ok(())
    }
}

impl Output for FarmManagerListOutput {}
impl Display for FarmManagerListOutput {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "{:^44} | {:^44}", "Address", "Owner")?;
        for (k, fm) in &self.0 {
            writeln!(f, "{:^44} | {:^44}", k, fm.authority)?;
        }
        Ok(())
    }
}
