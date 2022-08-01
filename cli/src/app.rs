use crate::{
    client::Client,
    output::{
        output_command, FarmListOutput, FarmManagerListOutput, OutputOptions, WhitelistListOutput,
    },
};
use anchor_client::{
    solana_sdk::{pubkey::Pubkey, signature::read_keypair_file},
    Cluster,
};
use anyhow::{anyhow, Result};
use clap::{arg_enum, Parser, Subcommand};
use std::{path::PathBuf, rc::Rc};

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

    let client = Client::new(args.url, Rc::new(payer))?;

    process_commands(client, args.command, OutputOptions::default())
}

fn process_commands(client: Client, command: Command, options: OutputOptions) -> Result<()> {
    match command {
        Command::Farm(cmd) => match cmd {
            FarmCommand::List { manager_address } => output_command(
                FarmListOutput(client.get_manager_farms(manager_address)?),
                options,
            ),
            FarmCommand::Stats { farm } => client.farm_stats(farm),
            FarmCommand::Create { reward_mint } => client.create_farm(reward_mint),
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

                RewardAction::Withdraw { .. } => Err(anyhow!("Withdrawal not supported yet.")),
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
            // FarmCommand::Locks { action } => match action {
            //    LocksAction::Add {} => client.add_to_locks()?,
            //    LocksAction::Remove {} => client.remove_from_locks()?,
            //    LocksAction::List {} => client.list_locks()?,
            // }
        },
    }
}
