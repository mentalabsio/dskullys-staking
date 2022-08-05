use anchor_client::solana_sdk::pubkey::Pubkey;
use magicshards_staking::instructions::LockConfig;

pub fn find_farm_address<T: AsRef<[u8]>>(farm_authority: T, reward_mint: T) -> Pubkey {
    Pubkey::find_program_address(
        &[b"farm", farm_authority.as_ref(), reward_mint.as_ref()],
        &magicshards_staking::id(),
    )
    .0
}

pub fn find_farm_manager_address<T: AsRef<[u8]>>(farm: T, authority: T) -> Pubkey {
    Pubkey::find_program_address(
        &[b"farm_manager", farm.as_ref(), authority.as_ref()],
        &magicshards_staking::id(),
    )
    .0
}

pub fn find_whitelist_proof_address<T: AsRef<[u8]>>(farm: T, address: T) -> Pubkey {
    Pubkey::find_program_address(
        &[b"collection_data", farm.as_ref(), address.as_ref()],
        &magicshards_staking::id(),
    )
    .0
}

pub fn find_lock_address<T: AsRef<[u8]>>(farm: T, config: LockConfig) -> Pubkey {
    Pubkey::find_program_address(
        &[
            b"lock",
            farm.as_ref(),
            &config.duration.to_le_bytes(),
            &config.cooldown.to_le_bytes(),
        ],
        &magicshards_staking::id(),
    )
    .0
}

#[allow(dead_code)]
pub fn find_stake_receipt_address<T: AsRef<[u8]>>(farmer: T, mint: T) -> Pubkey {
    Pubkey::find_program_address(
        &[b"stake_receipt", farmer.as_ref(), mint.as_ref()],
        &magicshards_staking::id(),
    )
    .0
}
