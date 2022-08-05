use crate::client::StakingClient;
use anchor_client::{
    solana_sdk::{pubkey::Pubkey, signature::read_keypair_file},
    Cluster,
};
use anyhow::{anyhow, bail, Result};
use clap::{arg_enum, Parser, Subcommand};
use magicshards_staking::instructions::LockConfig;
use serde::Deserialize;
use std::{path::PathBuf, rc::Rc};

mod output;
use output::*;

#[derive(Parser)]
#[clap(
    author,
    version,
    name = "staking-cli",
    bin_name = "staking",
    about = "Mentalabs staking CLI."
)]
struct Args {
    #[clap(
        short,
        long,
        global = true,
        value_parser,
        name = "URL OR MONIKER",
        default_value = "localnet"
    )]
    /// Solana JSON RPC URL or moniker.
    url: Cluster,
    #[clap(short, long, global = true, name = "PATH")]
    /// Path to the farm authority keypair file.
    keypair: Option<PathBuf>,
    #[clap(subcommand)]
    command: Command,
}

#[derive(Debug, Subcommand)]
enum Command {
    #[clap(subcommand)]
    Farm(FarmCommand),
}

#[derive(Debug, Subcommand)]
/// Farm management commands.
enum FarmCommand {
    /// Lists all farms where the payer is a manager.
    #[clap(alias = "ls")]
    List { manager_address: Option<Pubkey> },

    /// Shows farm details.
    Stats { farm: Pubkey },

    /// Creates a new farm.
    #[clap(alias = "new", alias = "init")]
    Create {
        /// Farm reward mint address.
        reward_mint: Pubkey,
    },

    /// Add or remove farm managers.
    Manager {
        #[clap(subcommand)]
        action: ManagerAction,
    },

    /// Add, remove and list farm whitelists.
    #[clap(alias = "wl")]
    Whitelist {
        #[clap(subcommand)]
        action: WhitelistAction,
    },

    /// Deposit or withdraw funds from a farm's reward vault.
    Reward {
        #[clap(subcommand)]
        action: RewardAction,
    },

    /// Create locks for a farm from a file.
    /// The file should be a JSON array of objects with the following fields:
    /// - `cooldown`: how many seconds until the NFT can be staked again.
    /// - `duration`: how many seconds the NFT will stay locked for staking.
    /// - `bonus_factor`: bonus percentage points. Will increase the reward rate by this factor. (0-255)
    Lock {
        #[clap(subcommand)]
        action: LockAction,
    },
}

#[derive(Debug, Subcommand)]
enum LockAction {
    /// Add new locks to a farm from a file.
    #[clap(alias = "create", alias = "new")]
    Add {
        farm_address: Pubkey,
        #[clap(required = true)]
        /// Path to the file containing the locks.
        file: PathBuf,
    },

    /// List all locks from a farm.
    #[clap(alias = "ls")]
    List { farm_address: Pubkey },
}

#[derive(Debug, Subcommand)]
enum WhitelistAction {
    /// Add a new creator or spl-token to the farm whitelist.
    #[clap(alias = "create", alias = "new")]
    Add {
        /// Farm address (payer must own a farm manager account).
        farm_address: Pubkey,
        /// Address to add to the whitelist.
        address: Pubkey,
        /// Whitelist type. Possible values: ["Creator", "SplToken"].
        #[clap(value_name = "WHITELIST-TYPE", default_value = "Creator")]
        ty: WhitelistType,
        /// How many tokens/sec the farmers will receive for every token they stake.
        #[clap(default_value = "1")]
        reward_rate: u64,
    },

    /// Remove a creator or spl-token from the farm whitelist.
    Remove {
        /// Farm address (payer must own a farm manager account).
        farm_address: Pubkey,
        /// Address to remove from the whitelist.
        address: Pubkey,
    },

    /// Displays every address whitelisted in a given farm.
    #[clap(alias = "ls")]
    List {
        /// Farm address.
        farm_address: Pubkey,
    },
}

#[derive(Debug, Subcommand)]
enum RewardAction {
    /// Fund farm rewards.
    Deposit {
        /// Farm address (payer must own a farm manager account).
        farm_address: Pubkey,
        /// Amount to deposit (without decimals).
        amount: u64,
    },

    /// Withdraw farm rewards.
    Withdraw {
        /// Farm address (payer must own a farm manager account).
        farm_address: Pubkey,
        /// Amount to deposit (without decimals).
        amount: u64,
    },
}

#[derive(Debug, Subcommand)]
enum ManagerAction {
    /// Add a new farm manager.
    #[clap(alias = "create", alias = "new")]
    Add {
        /// Farm address (payer must be the farm authority).
        farm_address: Pubkey,
        /// New manager's wallet address.
        manager_owner: Option<Pubkey>,
    },
    /// List all the managers from a farm.
    #[clap(alias = "ls")]
    List {
        /// Farm address.
        farm_address: Pubkey,
    },
}

arg_enum! {
    #[derive(Debug)]
    enum WhitelistType {
        Creator,
        SplToken,
    }
}

#[derive(Debug, Copy, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Lock {
    pub duration: u64,
    pub cooldown: u64,
    pub bonus_factor: u8,
}

impl From<WhitelistType> for magicshards_staking::state::WhitelistType {
    fn from(ty: WhitelistType) -> Self {
        match ty {
            WhitelistType::Creator => magicshards_staking::state::WhitelistType::Creator,
            WhitelistType::SplToken => magicshards_staking::state::WhitelistType::Mint,
        }
    }
}

pub fn run() -> Result<()> {
    let args = Args::parse();

    let payer = {
        let kp_path = match args.keypair {
            Some(path) => String::from(path.to_str().unwrap()),
            None => {
                let solana_config_file = solana_cli_config::CONFIG_FILE
                    .as_ref()
                    .ok_or_else(|| anyhow!("Config file not found."))?;
                let config =
                    solana_cli_config::Config::load(solana_config_file).unwrap_or_default();
                config.keypair_path
            }
        };

        read_keypair_file(&kp_path).map_err(|e| anyhow!("Failed to read keypair. {}.", e))?
    };

    let client = StakingClient::new(args.url, Rc::new(payer))?;

    process_command(client, args.command, OutputOptions::default())
}

fn process_command(client: StakingClient, command: Command, options: OutputOptions) -> Result<()> {
    match command {
        Command::Farm(cmd) => match cmd {
            FarmCommand::Create { reward_mint } => {
                let farm = client.create_farm(reward_mint)?;
                output_command(FarmCreateOutput(farm), options)
            }
            FarmCommand::List { manager_address } => output_command(
                FarmListOutput(client.get_manager_farms(manager_address)?),
                options,
            ),
            // TODO
            FarmCommand::Stats { farm } => client.farm_stats(farm),

            FarmCommand::Whitelist { action } => match action {
                WhitelistAction::Add {
                    farm_address,
                    address,
                    ty,
                    reward_rate,
                } => client.add_to_whitelist(farm_address, address, ty.into(), reward_rate),

                WhitelistAction::Remove {
                    farm_address,
                    address,
                } => client.remove_from_whitelist(farm_address, address),

                WhitelistAction::List { farm_address } => output_command(
                    WhitelistListOutput(client.get_farm_whitelists(farm_address)?),
                    options,
                ),
            },

            FarmCommand::Reward { action } => match action {
                RewardAction::Deposit {
                    farm_address,
                    amount,
                } => client.deposit_reward(farm_address, amount),

                // TODO
                RewardAction::Withdraw { .. } => bail!("Withdrawal not supported yet."),
            },

            FarmCommand::Manager { action } => match action {
                ManagerAction::Add {
                    farm_address,
                    manager_owner,
                } => client.add_manager(farm_address, manager_owner),

                ManagerAction::List { farm_address } => output_command(
                    FarmManagerListOutput(client.get_farm_managers(farm_address)?),
                    options,
                ),
            },

            FarmCommand::Lock { action } => match action {
                LockAction::Add { farm_address, file } => {
                    let content = std::fs::read_to_string(file)?;
                    let locks: Vec<Lock> = serde_json::from_str(&content)?;

                    let lock_configs: Vec<_> = locks
                        .into_iter()
                        .map(|l| LockConfig {
                            duration: l.duration,
                            cooldown: l.cooldown,
                            bonus_factor: l.bonus_factor,
                        })
                        .collect();

                    client.create_locks(farm_address, &lock_configs)
                }
                LockAction::List { farm_address } => {
                    output_command(LockListOutput(client.list_locks(farm_address)?), options)
                }
            },
        },
    }
}
