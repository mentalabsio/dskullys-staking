/** @jsxImportSource theme-ui */

import { Flex, Spinner, Text } from "@theme-ui/components"
import { NFT } from "@/hooks/useWalletNFTs"
import { useWallet } from "@solana/wallet-adapter-react"
import { StakeReceiptWithMetadata } from "@/hooks/useStaking"

export type NFTCollectionProps = {
  NFTs: NFT[] | StakeReceiptWithMetadata[]
  children?: React.ReactChild
}

/**
 * Component to displays all NFTs from a connected wallet
 */
export function NFTGallery({ NFTs, children }: NFTCollectionProps) {
  const { publicKey } = useWallet()

  return (
    <>
      {NFTs ? (
        NFTs.length ? (
          <div
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "1rem",
              alignItems: "center",
              maxHeight: "250px",
              overflowY: "scroll",
              paddingRight: "2rem",
              paddingBottom: "1rem",
              marginBottom: "1rem",

              "@media (min-width: 768px)": {
                gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
              },

              "&::-webkit-scrollbar": {
                width: "1px",
              },

              "&::-webkit-scrollbar-track": {
                boxShadow: "inset 0 0 6px rgba(255, 255, 255, 1)",
              },

              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#fff",
                outline: "1px solid #f1f1f1",
              },
            }}
          >
            {children}
          </div>
        ) : (
          /** NFTs fetched but array is empty, means current wallet has no NFT. */
          <Flex
            sx={{
              justifyContent: "center",
              alignSelf: "stretch",
            }}
          >
            <Text>There are no NFTs on your wallet.</Text>
          </Flex>
        )
      ) : /** No NFTs and public key, means it is loading */
      publicKey ? (
        <Flex
          sx={{
            justifyContent: "center",
            alignSelf: "stretch",
          }}
        >
          <Spinner variant="styles.spinnerLarge" />
        </Flex>
      ) : null}
    </>
  )
}
