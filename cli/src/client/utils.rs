use anchor_client::{
    anchor_lang::{AccountDeserialize, Discriminator},
    solana_client::rpc_filter::{Memcmp, MemcmpEncodedBytes, RpcFilterType},
    solana_sdk::pubkey::Pubkey,
    Program, ProgramAccountsIterator,
};
use anyhow::Context;

pub fn memcmp(offset: usize, bytes: &[u8]) -> RpcFilterType {
    RpcFilterType::Memcmp(Memcmp {
        offset,
        bytes: MemcmpEncodedBytes::Bytes(bytes.to_vec()),
        encoding: None,
    })
}

pub fn find_accounts<T: Discriminator + AccountDeserialize>(
    program: &Program,
    filters: &[RpcFilterType],
) -> anyhow::Result<Vec<(Pubkey, T)>> {
    let mut all = vec![memcmp(0, &T::discriminator())];
    all.extend_from_slice(filters);
    program
        .accounts::<T>(all)
        .map_err(anyhow::Error::new)
        .context("failed to get accounts")
}

pub fn find_accounts_lazy<T: Discriminator + AccountDeserialize>(
    program: &Program,
    filters: &[RpcFilterType],
) -> anyhow::Result<ProgramAccountsIterator<T>> {
    let mut all = vec![memcmp(0, &T::discriminator())];
    all.extend_from_slice(filters);
    program
        .accounts_lazy::<T>(all)
        .map_err(anyhow::Error::new)
        .context("failed to get accounts")
}
