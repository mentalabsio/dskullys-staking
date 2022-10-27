/** @jsxImportSource theme-ui */
import Head from "next/head"

import { Button, Flex, Heading, Text } from "@theme-ui/components"
import { useMemo, useState } from "react"

import { NFTGallery } from "@/components/NFTGallery/NFTGallery"
import CollectionItem from "@/components/NFTGallery/CollectionItem"
import useWalletNFTs, { NFT } from "@/hooks/useWalletNFTs"
import { Tab, TabList, TabPanel, Tabs } from "react-tabs"
import useStaking from "@/hooks/useStaking"
import { LoadingIcon } from "@/components/icons/LoadingIcon"
import WalletManager from "@/components/WalletManager/WalletManager"
import Image from "next/image"
import { useTotalStaked } from "@/hooks/useTotalStaked"
import ProgressBar from "@/components/ProgressBar/ProgressBar"
import { Box } from "theme-ui"
import { useWallet } from "@solana/wallet-adapter-react"
export default function Home() {
  const { walletNFTs, fetchNFTs } = useWalletNFTs([
    "Eq1ZERQ7yqU7LFuD9mHeHKvZFT899r7wSYpqrZ52HWE6",
  ])
  const {publicKey} = useWallet()
  const [selectedWalletItems, setSelectedWalletItems] = useState<NFT[]>([])
  const [selectedVaultItems, setSelectedVaultItems] = useState<NFT[]>([])

  const {
    farmerAccount,
    initFarmer,
    stakeAll,
    stakeSelected,
    claim,
    stakeReceipts,
    feedbackStatus,
    unstakeAll,
    fetchReceipts,
  } = useStaking()

  const { totalStaked } = useTotalStaked()

  /**
   * Handles selected items.
   */
  const handleWalletItemClick = (item: NFT) => {
    setSelectedWalletItems((prev) => {
      const exists = prev.find(
        (NFT) => NFT.onchainMetadata.mint === item.onchainMetadata.mint
      )

      /** Remove if exists */
      if (exists) {
        return prev.filter(
          (NFT) => NFT.onchainMetadata.mint !== item.onchainMetadata.mint
        )
      }

      return prev.length < 4 ? prev?.concat(item) : prev
    })
  }

  const handleVaultItemClick = (item: NFT) => {
    setSelectedVaultItems((prev) => {
      const exists = prev.find(
        (NFT) => NFT.onchainMetadata.mint === item.onchainMetadata.mint
      )

      /** Remove if exists */
      if (exists) {
        return prev.filter(
          (NFT) => NFT.onchainMetadata.mint !== item.onchainMetadata.mint
        )
      }

      return prev?.concat(item)
    })
  }

  const orderedReceipts = useMemo(() => {
    return (
      stakeReceipts &&
      stakeReceipts.sort((a, b) =>
        a.startTs.toNumber() < b.startTs.toNumber() ? 1 : -1
      )
    )
  }, [stakeReceipts])

  return (
    <>
      <Head>
        <title>DSkullys Staking</title>
        <meta
          name="description"
          content="Lock your DSKully and farm rewards."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          alignSelf: "stretch",
          margin: "0",
          position: "relative",
          padding: "0 1.6rem",
          width: "100%",
          maxHeight: "100vh",

          "*": {
            zIndex: 1,
          },
        }}
      >
        <Box
          sx={{
            position: "fixed",
            left: "0",
            top: "0",
            backgroundImage: "url(/dskullys_background.jpg)",
            backgroundSize: "cover",
            width: "100%",
            minHeight: "100vh",
            opacity: 0.7,
            zIndex: 0,
          }}
        ></Box>
        <Flex
          sx={{
            paddingTop: "1rem",
            width: "100%",
            alignItems: "center",
            justifyContent: "flex-end",
            maxWidth: "1200px",
            margin: "2rem 0 4rem 0",
          }}
        >
          <WalletManager />
        </Flex>
        <Heading
          mt="1rem"
          mb=".8rem"
          variant="heading1"
          sx={{
            fontFamily: "Quarry Bones",
            fontSize: "32px",
          }}
        >
          Stake your Skully
        </Heading>

        {publicKey && !farmerAccount ? (
          <>
            <Button mt="3.2rem" onClick={initFarmer}>
              Register as staker
            </Button>
            <Flex
              sx={{
                alignItems: "center",
                gap: ".8rem",
                margin: ".8rem 0",
              }}
            >
              {feedbackStatus ? (
                <>
                  {feedbackStatus.indexOf("Success") === -1 ? (
                    <LoadingIcon size="1.6rem" />
                  ) : null}
                  {"  "}{" "}
                  <Text
                    variant="small"
                    sx={{
                      color:
                        feedbackStatus.indexOf("Success") !== -1
                          ? "success"
                          : "text",
                    }}
                  >
                    {feedbackStatus}
                  </Text>
                </>
              ) : (
                ""
              )}
              &nbsp;
            </Flex>
          </>
        ) : null}

        {farmerAccount ? (
          <>
            <Flex
              my="3.2rem"
              sx={{
                flexDirection: "column",
                alignItems: "center",
                gap: "1.6rem",
                maxWidth: "1200px",
                width: "100%",
              }}
            >
              <Flex
                sx={{
                  gap: "1.6rem",
                }}
              >
                {/* {farmerAccount.accruedRewards.toNumber() ? (
                  <Text>
                    Rewards:{" "}
                    <b
                      sx={{
                        fontSize: "1.6rem",
                      }}
                    >
                      {(
                        farmerAccount.accruedRewards.toNumber() / 1e9
                      ).toFixed(2)}
                    </b>
                  </Text>
                ) : null} */}

                {/* {farmerAccount?.totalRewardRate?.toNumber() ? (
                  <Text>
                    Rate:{" "}
                    <b
                      sx={{
                        fontSize: "1.6rem",
                      }}
                    >
                      {(
                        (farmerAccount?.totalRewardRate?.toNumber() / 1e9) *
                        86400
                      ).toFixed(2)}{" "}
                    </b>
                    per day
                  </Text>
                ) : null} */}
              </Flex>
              <Flex
                sx={{
                  maxWidth: "240px",
                  width: "100%",

                  "@media screen and (min-width: 768px)": {
                    maxWidth: "600px",
                  },
                }}
              >
                <ProgressBar totalStaked={totalStaked} />
              </Flex>
              <Button onClick={claim}>Claim rewards</Button>

              <Flex
                sx={{
                  alignItems: "center",
                  gap: ".8rem",
                  margin: ".8rem 0",
                }}
              >
                {feedbackStatus ? (
                  <>
                    {feedbackStatus.indexOf("Success") === -1 ? (
                      <LoadingIcon size="1.6rem" />
                    ) : null}
                    {"  "}{" "}
                    <Text
                      variant="small"
                      sx={{
                        color:
                          feedbackStatus.indexOf("Success") !== -1
                            ? "success"
                            : "text",
                      }}
                    >
                      {feedbackStatus}
                    </Text>
                  </>
                ) : (
                  ""
                )}
                &nbsp;
              </Flex>
            </Flex>

            <Flex
              sx={{
                flexDirection: "column",
                gap: "1.6rem",
                alignSelf: "stretch",
                maxWidth: "1200px",
                margin: "3.2rem auto",
              }}
            >
              <Tabs
                sx={{
                  margin: "3.2rem 0",
                  alignSelf: "stretch",
                  minHeight: "48rem",
                }}
              >
                <TabList>
                  <Tab>Your wallet</Tab>
                  <Tab>Your vault</Tab>
                </TabList>

                <TabPanel>
                  <Flex
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                      margin: "1.6rem 0",
                      paddingBottom: ".8rem",
                    }}
                  >
                    <Heading variant="heading2">Your wallet NFTs</Heading>
                    <Flex>
                    <Button
                      onClick={async (e) => {
                        const allMints = selectedWalletItems.map(
                          (item) => item.mint
                        )
                        await stakeSelected(allMints)
                        await fetchNFTs()
                        await fetchReceipts()
                        setSelectedWalletItems([])
                      }}
                      disabled={!selectedWalletItems.length}
                    >
                      Stake Selected
                    </Button>
                    <Button
                      onClick={async (e) => {
                
                        await stakeAll(walletNFTs)
                        await fetchNFTs()
                        await fetchReceipts()
                        setSelectedWalletItems([])
                      }}
                      disabled={!walletNFTs || !walletNFTs.length}
                    >
                      Stake All
                    </Button>
                    </Flex>
                  </Flex>

                  <NFTGallery NFTs={walletNFTs}>
                    <>
                      {walletNFTs?.map((item) => {
                        const isSelected = selectedWalletItems.find(
                          (NFT) =>
                            NFT.onchainMetadata.mint ===
                            item.onchainMetadata.mint
                        )

                        return (
                          <Flex
                            key={item.onchainMetadata.mint}
                            sx={{
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "1.6rem",
                            }}
                          >
                            <CollectionItem
                              key={item.onchainMetadata.mint}
                              item={item}
                              onClick={handleWalletItemClick}
                              sx={{
                                maxWidth: "16rem",
                                "> img": {
                                  border: "3px solid transparent",
                                  borderColor: isSelected
                                    ? "highlight"
                                    : "transparent",
                                },
                              }}
                            />
                          </Flex>
                        )
                      })}
                    </>
                  </NFTGallery>
                </TabPanel>

                <TabPanel>
                  <Flex
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                      margin: "1.6rem 0",
                      paddingBottom: ".8rem",
                    }}
                  >
                    <Heading variant="heading2">Your vault NFTs</Heading>
                    <Button
                      onClick={async (e) => {
                        const allMints = selectedVaultItems.map(
                          (item) => item.mint
                        )
                        await unstakeAll(allMints)
                        await fetchNFTs()
                        await fetchReceipts()
                        setSelectedVaultItems([])
                      }}
                      disabled={!selectedVaultItems.length}
                    >
                      Unstake selected
                    </Button>
                  </Flex>
                  <NFTGallery NFTs={orderedReceipts}>
                    <>
                      {orderedReceipts &&
                        orderedReceipts.map((stake) => {
                          const isSelected = selectedVaultItems.find(
                            (NFT) =>
                              NFT.onchainMetadata.mint ===
                              stake.metadata.onchainMetadata.mint
                          )

                          return (
                            <Flex
                              key={stake.metadata.onchainMetadata.mint}
                              sx={{
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "1.6rem",
                              }}
                            >
                              <CollectionItem
                                sx={{
                                  maxWidth: "16rem",
                                  "> img": {
                                    border: "3px solid transparent",
                                    borderColor: isSelected
                                      ? "highlight"
                                      : "transparent",
                                  },
                                }}
                                onClick={handleVaultItemClick}
                                item={stake.metadata}
                              />
                              {/* <Flex
                                sx={{
                                  gap: "1.6rem",
                                  alignItems: "center",
                                  flexDirection: "column",
                                  marginTop: "1.6rem",
                                }}
                              >
                                <Button variant="resetted">Unstake</Button>
                              </Flex> */}
                            </Flex>
                          )
                        })}
                    </>
                  </NFTGallery>
                </TabPanel>
              </Tabs>

              {/* <Flex
            sx={{
              flexDirection: "column",
              gap: ".8rem",
            }}
          >
            <Heading variant="heading3">NFT Selector:</Heading>
            <NFTSelectInput name="nft" NFTs={walletNFTs} />
          </Flex> */}
            </Flex>
          </>
        ) : null}
      </main>
    </>
  )
}
