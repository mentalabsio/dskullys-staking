/** @jsxImportSource theme-ui */
import React, { useRef, useState } from "react"
import { Button, Flex, Text } from "theme-ui"

import { DotsIcon } from "@/components/icons/"
import useOutsideClick from "@/hooks/useOutsideClick"
import { NFT } from "@/hooks/useWalletNFTs"

type Props = {
  item: NFT
  additionalOptions?: React.ReactElement
  onClick?: (item: NFT) => void
  className?: string
  isSelected: boolean
}

const CollectionItem = (props: Props) => {
  const {
    item,
    additionalOptions = null,
    className,
    onClick,
    isSelected,
  } = props
  const [isDropdownActive, setIsDropdownActive] = useState(false)
  const wrapperRef = useRef(null)
  useOutsideClick(wrapperRef, () => setIsDropdownActive(false))

  const handleDropdownToggle = () => {
    setIsDropdownActive((previous) => !previous)
  }

  if (!item) return null

  const { onchainMetadata, externalMetadata } = item

  const handleOnClick = (item: NFT) => () => onClick ? onClick(item) : true

  return (
    <Flex
      tabIndex={1}
      ref={wrapperRef}
      sx={{
        flexDirection: "column",
        position: "relative",
        transition: "all .25s linear",
        outline: "none",
        cursor: onClick ? "pointer" : "auto",
        maxWidth: "16rem",

        "&:hover, &:focus, > .toggle-menu:focus": {
          "> .toggle-menu": {
            visibility: "visible",
            opacity: 1,
          },
        },
      }}
      className={className}
    >
      <Button
        tabIndex={1}
        variant="resetted"
        className="toggle-menu"
        onClick={handleDropdownToggle}
        sx={{
          display: "flex",
          position: "absolute",
          visibility: isDropdownActive ? "visible" : "hidden",
          opacity: isDropdownActive ? 1 : 0,
          right: ".8rem",
          top: ".8rem",
          zIndex: 1,
          transition: "all .125s linear",

          "&:hover, &:focus": {
            visibility: "visible",
            cursor: "pointer",
            opacity: 1,
          },
        }}
      >
        <DotsIcon
          sx={{
            width: "3.2rem",
            height: "3.2rem",
            stroke: "heading",
            strokeWidth: "2",
          }}
        />
      </Button>
      {/** Dropdown */}
      <Flex
        sx={{
          position: "absolute",
          visibility: isDropdownActive ? "visible" : "hidden",
          opacity: isDropdownActive ? 1 : 0,
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "2.4rem 1.2rem",
          top: 40,
          right: 0,
          backgroundColor: "background",
          transition: "all .125s linear",
          boxShadow: "0px 5px 5px rgba(0,0,0,0.25)",
          gap: ".8rem",
          zIndex: 2,
          fontSize: "1.2rem",
          borderRadius: '5px',

          a: {
            whiteSpace: "nowrap",
          },
        }}
      >
        <a
          href={`https://solscan.io/token/${onchainMetadata.mint}`}
          rel="noopener noreferrer"
          target="_blank"
          tabIndex={1}
        >
          View on Solscan
        </a>
        <a
          href={externalMetadata.image}
          rel="noopener noreferrer"
          target="_blank"
          tabIndex={1}
        >
          View image
        </a>
        {additionalOptions || null}
      </Flex>
      <img
        sx={{
          borderRadius: "5px",
          transition: "all .5s linear",
          opacity: isDropdownActive ? 0.7 : 1,
          border: "3px solid transparent",
          borderColor: isSelected ? "highlight" : "#111111",
        }}
        src={externalMetadata.image}
      />
      <Text
        variant="small"
        sx={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          padding: "0 .8rem",
          mt: ".8rem",
        }}
      >
        {externalMetadata.name}
        {/* <br />
    <a
      href={`https://solscan.io/token/${onchainMetadata.metaData.mint}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {onchainMetadata.metaData.mint}
    </a> */}
      </Text>
    </Flex>
  )
}

export default CollectionItem
