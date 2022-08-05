use anchor_client::{
    anchor_lang::{solana_program, system_program},
    solana_sdk::{
        commitment_config::CommitmentConfig, instruction::AccountMeta, pubkey::Pubkey,
        signer::Signer,
    },
    Cluster, Program,
};
use anyhow::{Context, Result};
use magicshards_staking::{
    accounts,
    instructions::LockConfig,
    state::{Farm, FarmManager, Lock, WhitelistProof, WhitelistType},
};
use std::rc::Rc;

use pda::*;
use utils::*;

mod pda;
mod utils;

pub struct StakingClient {
    program: Program,
    payer: Rc<dyn Signer>,
}

impl StakingClient {
    pub fn new(cluster: Cluster, payer: Rc<dyn Signer>) -> Result<Self> {
        let client = anchor_client::Client::new_with_options(
            cluster,
            payer.clone(),
            CommitmentConfig::processed(),
        );

        Ok(Self {
            program: client.program(magicshards_staking::ID),
            payer,
        })
    }

    pub fn get_manager_farms(&self, manager_wallet: Option<Pubkey>) -> Result<Vec<(Pubkey, Farm)>> {
        let farms = find_accounts_lazy(&self.program, &[])?.filter_map(Result::ok);
        let manager = manager_wallet.unwrap_or_else(|| self.payer.pubkey());
        let mut manager_accounts =
            find_accounts_lazy::<FarmManager>(&self.program, &[memcmp(40, manager.as_ref())])?
                .filter_map(Result::ok);

        Ok(farms
            .filter(|(k, _)| manager_accounts.any(|(_, data)| data.farm == *k))
            .collect())
    }

    pub fn get_farm_whitelists(&self, farm: Pubkey) -> Result<Vec<(Pubkey, WhitelistProof)>> {
        find_accounts(&self.program, &[memcmp(40, farm.as_ref())])
    }

    pub fn get_farm_managers(&self, farm: Pubkey) -> Result<Vec<(Pubkey, FarmManager)>> {
        find_accounts::<FarmManager>(&self.program, &[memcmp(8, farm.as_ref())])
    }

    pub fn farm_stats(&self, farm: Pubkey) -> Result<()> {
        let _farm: Farm = self.program.account(farm)?;
        todo!("farm stats")
    }

    pub fn create_farm(&self, reward_mint: Pubkey) -> Result<Pubkey> {
        let farm = pda::find_farm_address(self.payer.pubkey(), reward_mint);
        let farm_vault =
            anchor_spl::associated_token::get_associated_token_address(&farm, &reward_mint);

        let accs = accounts::CreateFarm {
            farm,
            authority: self.payer.pubkey(),
            reward_mint,
            farm_vault,
            rent: solana_program::sysvar::rent::ID,
            system_program: system_program::ID,
            token_program: anchor_spl::token::ID,
            associated_token_program: anchor_spl::associated_token::ID,
        };

        self.program
            .request()
            .accounts(accs)
            .args(magicshards_staking::instruction::CreateFarm)
            .send()?;

        let farm_manager = find_farm_manager_address(farm, self.payer.pubkey());
        let accs = accounts::AddManager {
            farm,
            farm_manager,
            manager_authority: self.payer.pubkey(),
            authority: self.payer.pubkey(),
            system_program: system_program::ID,
        };

        self.program
            .request()
            .accounts(accs)
            .args(magicshards_staking::instruction::AddManager)
            .send()?;

        Ok(farm)
    }

    pub fn add_manager(&self, farm: Pubkey, manager_owner: Option<Pubkey>) -> Result<()> {
        let manager_owner = manager_owner.unwrap_or_else(|| self.payer.pubkey());
        let farm_manager = find_farm_manager_address(farm, manager_owner);

        let accs = accounts::AddManager {
            farm,
            farm_manager,
            manager_authority: manager_owner,
            authority: self.payer.pubkey(),
            system_program: system_program::ID,
        };

        let signature = self
            .program
            .request()
            .accounts(accs)
            .args(magicshards_staking::instruction::AddManager)
            .signer(&*self.payer)
            .send()?;

        println!(
            "Manager added to farm {}. Signature: {signature}.",
            farm_manager
        );

        Ok(())
    }

    pub fn add_to_whitelist(
        &self,
        farm: Pubkey,
        address_to_whitelist: Pubkey,
        whitelist_type: WhitelistType,
        reward_rate: u64,
    ) -> Result<()> {
        let farm_manager = pda::find_farm_manager_address(farm, self.payer.pubkey());
        let whitelist_proof = pda::find_whitelist_proof_address(farm, address_to_whitelist);

        let accs = accounts::AddToWhitelist {
            farm,
            farm_manager,
            whitelist_proof,
            creator_or_mint: address_to_whitelist,
            authority: self.payer.pubkey(),
            system_program: system_program::ID,
        };

        let tx_sig = self
            .program
            .request()
            .accounts(accs)
            .args(magicshards_staking::instruction::AddToWhitelist {
                whitelist_type,
                reward_rate,
            })
            .signer(&*self.payer)
            .send()?;

        let whitelist_account: WhitelistProof = self.program.account(whitelist_proof)?;

        println!(
            "Added {} to whitelist. Signature: {}",
            whitelist_account.whitelisted_address, tx_sig
        );

        Ok(())
    }

    pub fn remove_from_whitelist(&self, farm: Pubkey, address: Pubkey) -> Result<()> {
        let farm_manager = pda::find_farm_manager_address(farm, self.payer.pubkey());
        let whitelist_proof = pda::find_whitelist_proof_address(farm, address);

        let accs = accounts::RemoveFromWhitelist {
            farm,
            farm_manager,
            whitelist_proof,
            authority: self.payer.pubkey(),
            system_program: system_program::ID,
        };

        let signature = self
            .program
            .request()
            .accounts(accs)
            .args(magicshards_staking::instruction::RemoveFromWhitelist)
            .signer(&*self.payer)
            .send()?;

        println!(
            "Removed {} from whitelist. Signature: {}",
            address, signature
        );

        Ok(())
    }

    pub fn deposit_reward(&self, farm: Pubkey, amount: u64) -> Result<()> {
        let farm_manager = pda::find_farm_manager_address(farm, self.payer.pubkey());
        let farm_account: Farm = self
            .program
            .account(farm)
            .with_context(|| format!("Farm {} not found", farm))?;

        let farm_vault = anchor_spl::associated_token::get_associated_token_address(
            &farm,
            &farm_account.reward.mint,
        );

        let manager_ata = anchor_spl::associated_token::get_associated_token_address(
            &self.payer.pubkey(),
            &farm_account.reward.mint,
        );

        let accs = accounts::FundReward {
            farm,
            mint: farm_account.reward.mint,
            farm_vault,
            farm_manager,
            manager_ata,
            authority: self.payer.pubkey(),
            token_program: anchor_spl::token::ID,
        };

        let signature = self
            .program
            .request()
            .accounts(accs)
            .args(magicshards_staking::instruction::FundReward { amount })
            .signer(&*self.payer)
            .send()?;

        println!(
            "Deposited {} to farm {}. Signature: {}",
            amount, farm, signature
        );

        Ok(())
    }

    pub fn create_locks(&self, farm: Pubkey, locks: &[LockConfig]) -> Result<()> {
        let farm_manager = pda::find_farm_manager_address(farm, self.payer.pubkey());

        let accs = accounts::CreateLocks {
            farm,
            farm_manager,
            authority: self.payer.pubkey(),
            system_program: system_program::ID,
        };

        let locks_meta = locks
            .iter()
            .map(|&config| AccountMeta::new(pda::find_lock_address(farm, config), false))
            .collect::<Vec<_>>();

        let count = locks.len();

        self.program
            .request()
            .accounts(accs)
            .accounts(locks_meta)
            .args(magicshards_staking::instruction::CreateLocks {
                lock_configs: locks.into(),
            })
            .signer(&*self.payer)
            .send()?;

        // TODO: move to output.
        println!("{count} locks created.");

        Ok(())
    }

    pub fn list_locks(&self, farm: Pubkey) -> Result<Vec<(Pubkey, Lock)>> {
        find_accounts(&self.program, &[memcmp(8, farm.as_ref())])
    }
}
