use anchor_lang::prelude::*;

#[account]
pub struct StakeReceipt {
    pub farmer: Pubkey,
    pub mint: Pubkey,
    pub lock: Pubkey,
    pub start_ts: u64,
    pub end_ts: Option<u64>,
    pub amount: u64,
    pub reward_rate: u64,
    _reserved: [u8; 64],
}

impl StakeReceipt {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 9 + 8 + 8 + 64;
    pub const PREFIX: &'static [u8] = b"stake_receipt";

    pub fn new(
        farmer: Pubkey,
        mint: Pubkey,
        lock: Pubkey,
        start_ts: u64,
        amount: u64,
        reward_rate: u64,
    ) -> Self {
        Self {
            farmer,
            mint,
            lock,
            start_ts,
            end_ts: None,
            amount,
            reward_rate,
            _reserved: [0; 64],
        }
    }

    pub fn is_running(&self) -> bool {
        self.end_ts.is_none()
    }
}
