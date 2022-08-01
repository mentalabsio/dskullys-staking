use anchor_client::{
    solana_client::rpc_request::{RpcError, RpcResponseErrorData},
    ClientError,
};

fn main() {
    if let Err(e) = staking_client::app::run() {
        if let Some(ClientError::SolanaClientError(e)) = e.downcast_ref::<ClientError>() {
            match e.kind {
                anchor_client::solana_client::client_error::ClientErrorKind::RpcError(
                    RpcError::RpcResponseError {
                        ref data,
                        ref message,
                        ..
                    },
                ) => {
                    eprintln!("{message}");
                    if let RpcResponseErrorData::SendTransactionPreflightFailure(e) = data {
                        let logs = e
                            .logs
                            .as_ref()
                            .map(|l| l.join("\n    "))
                            .unwrap_or_default();
                        eprintln!("Logs: \n    {}", logs);
                    }
                }

                _ => eprintln!("Client error: {}", e),
            }
        } else {
            eprintln!("Error: {}", e);
        }
    }
}
