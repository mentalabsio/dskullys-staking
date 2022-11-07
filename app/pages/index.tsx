/** @jsxImportSource theme-ui */
import Head from "next/head"

import { Button, Flex, Heading, Text } from "@theme-ui/components"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"

import { NFTGallery } from "@/components/NFTGallery/NFTGallery"
import CollectionItem from "@/components/NFTGallery/CollectionItem"
import useWalletNFTs, { NFT } from "@/hooks/useWalletNFTs"
import useStaking from "@/hooks/useStaking"
import WalletManager from "@/components/WalletManager/WalletManager"
import { useTotalStaked } from "@/hooks/useTotalStaked"
import { Box } from "theme-ui"
import { useWallet } from "@solana/wallet-adapter-react"
import { Toaster } from "react-hot-toast"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { SolanaIcon } from "@/components/icons/SolanaIcon"
import Image from "next/image"
import { Tooltip } from "antd"
import Donut from "@/components/Donut/Donut"

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
            display: "none",
            position: "fixed",
            left: "0",
            top: "0",
            backgroundImage: "url(/dskullys_background.jpg)",
            backgroundSize: "cover",
            width: "100%",
            minHeight: "100vh",
            opacity: 0.6,
            zIndex: 0,

            "@media screen and (min-width: 768px)": {
              display: "block",
            },
          }}
        ></Box>
        <Toaster />
        <>
          <Flex
            sx={{
              flexDirection: "column",
              maxWidth: "1200px",
              margin: "3.2rem auto",
            }}
          >
            <Flex
              sx={{
                flexDirection: "column",
                alignItems: "flex-end",
                justifyContent: "space-between",
                margin: "0.5rem 0",

                "@media screen and (min-width: 768px)": {
                  flexDirection: "row",
                },
              }}
            >
              <Flex
                sx={{
                  flexDirection: "column",
                  width: "100%",

                  "@media screen and (min-width: 768px)": {
                    marginRight: "1rem",
                  },
                }}
              >
                <Flex
                  sx={{
                    flexDirection: "column",
                    width: "100%",
                    backgroundColor: "rgba(0,0,0,0.4)",
                    padding: "2rem 4rem",
                    borderRadius: "5px",
                    marginBottom: "1rem",
                  }}
                >
                  <Heading
                    sx={{
                      fontFamily: "Quarry Bones",
                      color: "primary",
                    }}
                  >
                    Stake your Skully
                  </Heading>
                  <Text
                    sx={{
                      color: "primary",
                    }}
                  >
                    Lock your DSkully to receive $SKULLY rewards. If your
                    DSKully has the Essence attribute, rewards are doubled 🫡
                  </Text>
                </Flex>
                <Flex
                  sx={{
                    width: "100%",
                    backgroundColor: "rgba(0,0,0,0.4)",
                    padding: "2rem 4rem",
                    borderRadius: "5px",
                  }}
                >
                  <Flex
                    sx={{
                      flexDirection: "column",
                      marginBottom: "0.5rem",
                      width: "100%",
                    }}
                  >
                    {/* Current user claimable rewards */}
                    {rewardsCounter ? (
                      <Flex
                        sx={{
                          width: "100%",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          sx={{
                            color: "primary",
                            opacity: 0.7,
                          }}
                        >
                          User claimable rewards
                        </Text>
                        <Tooltip title="Total user rewards in $SKULL">
                          <Flex
                            sx={{
                              alignItems: "center",
                              justifyContent: "flex-end",
                              padding: "0 1rem",
                              minWidth: "150px",
                            }}
                          >
                            <Text
                              sx={{
                                color: "primary",
                                marginLeft: "0.5rem",
                                cursor: "help",
                                textAlign: "right",
                              }}
                            >
                              {" "}
                              {(rewardsCounter / 1e9).toFixed(4)} $SKULL
                            </Text>
                          </Flex>
                        </Tooltip>
                      </Flex>
                    ) : null}
                    {/* Current user rewards rate */}
                    {farmerAccount ? (
                      <Flex
                        sx={{
                          width: "100%",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          sx={{
                            color: "primary",
                            opacity: 0.7,
                          }}
                        >
                          User rewards rate
                        </Text>
                        <Tooltip title="Daily user rewards in $SKULL">
                          <Flex
                            sx={{
                              alignItems: "center",
                              justifyContent: "flex-end",
                              padding: "0 1rem",
                              minWidth: "150px",
                            }}
                          >
                            <Text
                              sx={{
                                color: "primary",
                                marginLeft: "0.5rem",
                                cursor: "help",
                                textAlign: "right",
                              }}
                            >
                              {" "}
                              {(
                                (farmerAccount?.totalRewardRate.toNumber() *
                                  86400) /
                                1e9
                              ).toFixed(0)}{" "}
                              $SKULL/day
                            </Text>
                          </Flex>
                        </Tooltip>
                      </Flex>
                    ) : null}
                    {/* Total NFTs staked */}
                    <Flex
                      sx={{
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        sx={{
                          color: "primary",
                          opacity: 0.7,
                        }}
                      >
                        Total NFTs staked
                      </Text>
                      <Tooltip title="Total NFTs staked">
                        <Flex
                          sx={{
                            alignItems: "center",
                            padding: "0 1rem",
                          }}
                        >
                          <Text
                            sx={{
                              color: "primary",
                              marginRight: "0.5rem",
                              cursor: "help",
                            }}
                          >
                            {" "}
                            {totalStaked}/5555
                          </Text>
                          <Image
                            src={"/favicon.ico"}
                            width="20"
                            height="19.1"
                          />
                        </Flex>
                      </Tooltip>
                    </Flex>
                    {/* TVL */}
                    <Flex
                      sx={{
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        sx={{
                          color: "primary",
                          opacity: 0.7,
                        }}
                      >
                        Total Value Locked
                      </Text>
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
                              color: "primary",
                              cursor: "help",
                            }}
                          >
                            {(collectionData?.floorPrice * totalStaked) /
                              LAMPORTS_PER_SOL || "NaN"}{" "}
                          </Text>
                          <SolanaIcon />
                        </Flex>
                      </Tooltip>
                    </Flex>
                    {/* Total rewards emission */}
                    <Flex
                      sx={{
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        sx={{
                          color: "primary",
                          opacity: 0.7,
                        }}
                      >
                        Total rewards emission
                      </Text>
                      <Tooltip title="Total token rewards emission">
                        <Flex
                          sx={{
                            alignItems: "center",
                            padding: "0 1rem",
                          }}
                        >
                          <Text
                            sx={{
                              color: "primary",
                              marginLeft: "0.5rem",
                              cursor: "help",
                            }}
                          >
                            {" "}
                            {((totalRewardsEmission * 86400) / 1e9).toFixed(
                              0
                            )}{" "}
                            $SKULL/day
                          </Text>
                        </Flex>
                      </Tooltip>
                    </Flex>
                    {/* Average NFTs staked per user */}
                    <Flex
                      sx={{
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        sx={{
                          color: "primary",
                          opacity: 0.7,
                        }}
                      >
                        Average NFTs staked per user
                      </Text>
                      <Tooltip title="totalNFTs / totalFarmers">
                        <Flex
                          sx={{
                            alignItems: "center",
                            padding: "0 1rem",
                          }}
                        >
                          <Text
                            sx={{
                              color: "primary",
                              marginRight: "0.5rem",
                              cursor: "help",
                            }}
                          >
                            {" "}
                            {averageStakedAmount.toFixed(2)}
                          </Text>
                          <Image
                            src={"/favicon.ico"}
                            width="20"
                            height="19.1"
                          />
                        </Flex>
                      </Tooltip>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <Flex
                sx={{
                  width: "100%",
                  backgroundColor: "rgba(0,0,0,0.4)",
                  padding: "2rem 0",
                  borderRadius: "5px",
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: "stretch",
                }}
              >
                <Donut totalStaked={totalStaked} />
              </Flex>
            </Flex>
            {/* User wallet NFTs */}
            <Flex
              sx={{
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                margin: "0.5rem 0",
                paddingBottom: ".8rem",
                backgroundColor: "rgba(0,0,0,0.4)",
                padding: "2rem 4rem",
                borderRadius: "5px",
              }}
            >
              <NFTGallery NFTs={walletNFTs}>
                <>
                  {walletNFTs?.map((item) => {
                    const isSelected = selectedWalletItems.some(
                      (NFT) =>
                        NFT.onchainMetadata.mint === item.onchainMetadata.mint
                    )

                    return (
                      <Flex
                        key={item.onchainMetadata.mint}
                        sx={{
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "1rem",
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
              <Flex
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
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
                <Flex
                  sx={{
                    gap: "1rem",
                  }}
                >
                  <WalletManager />
                  {publicKey && !farmerAccount ? (
                    <>
                      <Button onClick={initFarmer}>Register as staker</Button>
                    </>
                  ) : null}
                </Flex>
              </Flex>
            </Flex>

            {/* User staked NFTs */}
            <Flex
              sx={{
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                margin: "0.5rem 0",
                paddingBottom: ".8rem",
                backgroundColor: "rgba(0,0,0,0.4)",
                padding: "2rem 4rem",
                borderRadius: "5px",
              }}
            >
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
                            gap: "1rem",
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
                        </Flex>
                      )
                    })}
                </>
              </NFTGallery>

              <Flex
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
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
                        selectedVaultItems.length === orderedReceipts?.length
                          ? []
                          : orderedReceipts.map((stake) => stake.metadata)
                      )
                    }}
                    disabled={!walletNFTs || !walletNFTs?.length}
                  >
                    {selectedVaultItems.length === orderedReceipts?.length
                      ? "Deselect"
                      : "Select"}{" "}
                    all
                  </Button>
                </Flex>
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
          </Flex>
        </>
      </main>
    </>
  )
}
