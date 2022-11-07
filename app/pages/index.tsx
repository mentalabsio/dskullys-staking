/** @jsxImportSource theme-ui */
import Head from "next/head"

import { Button, Flex, Heading, Text } from "@theme-ui/components"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"

import { NFTGallery } from "@/components/NFTGallery/NFTGallery"
import CollectionItem from "@/components/NFTGallery/CollectionItem"
import useWalletNFTs, { NFT } from "@/hooks/useWalletNFTs"
import { Tab, TabList, TabPanel, Tabs } from "react-tabs"
import useStaking from "@/hooks/useStaking"
import WalletManager from "@/components/WalletManager/WalletManager"
import { useTotalStaked } from "@/hooks/useTotalStaked"
import ProgressBar from "@/components/ProgressBar/ProgressBar"
import { Box } from "theme-ui"
import { useWallet } from "@solana/wallet-adapter-react"
import { Toaster } from "react-hot-toast"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { SolanaIcon } from "@/components/icons/SolanaIcon"
import Image from "next/image"
import { getGradient } from "@/styles/theme"
import { Tooltip } from "antd"
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef(callback)
  useIsomorphicLayoutEffect(() => {
    savedCallback.current = callback
  }, [callback])
  useEffect(() => {
    if (!delay && delay !== 0) {
      return
    }
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

type CollectionData = {
  avgPrice24hr: number
  floorPrice: number
  listedCount: number
  symbol: string
  volumeAll: number
}

export default function Home() {
  const { walletNFTs, fetchNFTs } = useWalletNFTs([
    "Eq1ZERQ7yqU7LFuD9mHeHKvZFT899r7wSYpqrZ52HWE6",
  ])
  const { publicKey } = useWallet()
  const [selectedWalletItems, setSelectedWalletItems] = useState<NFT[]>([])
  const [selectedVaultItems, setSelectedVaultItems] = useState<NFT[]>([])
  const [rewardsCounter, setRewardsCounter] = useState<number>(0)
  const [collectionData, setCollectionData] = useState<CollectionData>(null)
  const [chainData, setChainData] = useState(null)
  console.log(chainData)
  const {
    farmerAccount,
    initFarmer,
    stakeSelected,
    claim,
    stakeReceipts,
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

      return prev?.concat(item)
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

  useInterval(() => {
    const currentRewards =
      farmerAccount?.accruedRewards?.toNumber() +
      (new Date().getTime() / 1000 - farmerAccount?.lastUpdate?.toNumber()) *
        farmerAccount?.totalRewardRate?.toNumber()
    setRewardsCounter(currentRewards)
  }, 1000)

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        const data = await fetch(
          "https://api-mainnet.magiceden.dev/v2/collections/dskullys/stats",
          {
            method: "GET",
            mode: "cors",
          }
        )
        const response = await data.json()
        setCollectionData(response)
      } catch (e) {
        console.error(e)
      }
    }

    if (!collectionData) fetchCollectionData()
  }, [collectionData])

  useEffect(() => {
    const fetchChainData = async () => {
      const data = await fetch("https://api.solscan.io/chaininfo").then((res) =>
        res.json()
      )
      setChainData(data)
    }
    if (!chainData) fetchChainData()
  }, [chainData])

  console.log(collectionData)

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

          ">*": {
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
            opacity: 0.6,
            zIndex: 0,
          }}
        ></Box>
        <Toaster />
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
                  flexDirection: "column",

                  "@media screen and (min-width: 768px)": {
                    maxWidth: "600px",
                  },
                }}
              >
                <Flex
                  sx={{
                    padding: "0.5rem",
                    backgroundImage: getGradient("rgb(255, 255, 255)"),
                    maxWidth: "fit-content",
                    borderRadius: "5px",
                    marginBottom: "0.5rem",
                  }}
                >
                  <Tooltip title="Total NFTs staked">
                    <Flex
                      sx={{
                        alignItems: "center",
                        padding: "0 1rem",
                      }}
                    >
                      <Image src={"/favicon.ico"} width="20" height="19.1" />
                      <Text
                        sx={{
                          color: "#111111",
                          marginLeft: "0.5rem",
                          cursor: "help",
                        }}
                      >
                        {" "}
                        {totalStaked}
                      </Text>
                    </Flex>
                  </Tooltip>
                  <Tooltip title="TVL in SOL (totalStaked * floorPrice)">
                    <Flex
                      sx={{
                        alignItems: "center",
                        padding: "0 1rem",
                      }}
                    >
                      <Text
                        sx={{
                          marginRight: "0.5rem",
                          color: "#111111",
                          cursor: 'help'
                        }}
                      >
                        {(collectionData?.floorPrice * totalStaked) /
                          LAMPORTS_PER_SOL}{" "}
                      </Text>
                      <SolanaIcon />
                    </Flex>
                  </Tooltip>
                </Flex>
                <ProgressBar totalStaked={totalStaked} />
              </Flex>
              <Flex
                sx={{
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {rewardsCounter && orderedReceipts?.length ? (
                  <Flex
                    sx={{
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: "lightgreen",
                        borderRadius: "5px",
                        width: "5px",
                        height: "5px",
                      }}
                    ></Box>

                    <Text
                      sx={{
                        fontSize: "1.2rem",
                        marginLeft: "0.5rem",
                      }}
                    >
                      {(rewardsCounter / 1e9).toFixed(5)} <Text>$SKULL</Text>
                    </Text>
                  </Flex>
                ) : null}
                <Button
                  onClick={async () => {
                    await claim()
                    await fetchNFTs()
                    await fetchReceipts()
                  }}
                >
                  Claim rewards
                </Button>
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
                    <Flex
                      sx={{
                        alignItems: "center",
                        gap: ".8rem",
                      }}
                    >
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
                        Stake selected
                      </Button>
                      <Button
                        onClick={async () => {
                          setSelectedWalletItems(
                            selectedWalletItems.length === walletNFTs?.length
                              ? []
                              : walletNFTs
                          )
                        }}
                        disabled={!walletNFTs || !walletNFTs?.length}
                      >
                        {selectedWalletItems.length === walletNFTs?.length
                          ? "Deselect"
                          : "Select"}{" "}
                        all
                      </Button>
                    </Flex>
                  </Flex>

                  <NFTGallery NFTs={walletNFTs}>
                    <>
                      {walletNFTs?.map((item) => {
                        const isSelected = selectedWalletItems.some(
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
                              isSelected={isSelected}
                              sx={{
                                maxWidth: "16rem",
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
                    <Flex
                      sx={{
                        alignItems: "center",
                        gap: ".8rem",
                      }}
                    >
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
                      <Button
                        onClick={async () => {
                          setSelectedVaultItems(
                            selectedVaultItems.length ===
                              orderedReceipts?.length
                              ? []
                              : orderedReceipts.map((stake) => stake.metadata)
                          )
                        }}
                      >
                        {selectedVaultItems.length === orderedReceipts?.length
                          ? "Deselect"
                          : "Select"}{" "}
                        all
                      </Button>
                    </Flex>
                  </Flex>
                  <NFTGallery NFTs={orderedReceipts}>
                    <>
                      {orderedReceipts &&
                        orderedReceipts.map((stake) => {
                          const isSelected = selectedVaultItems.some(
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
                                }}
                                onClick={handleVaultItemClick}
                                item={stake.metadata}
                                isSelected={isSelected}
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
