/** @jsxImportSource theme-ui */
import React, { useRef, useState } from "react"
import { Button, Flex } from "theme-ui"

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
        maxWidth: "12rem",
        border: isSelected
          ? "6px solid rgba(245, 244, 78, 1)"
          : "6px solid rgba(206, 206, 206, 1)",
        borderRadius: "5px",
        backgroundColor: "rgba(206, 206, 206, 1)",
        boxShadow: isSelected
          ? "4px 4px 0 0 rgba(245, 244, 78, 0.5)"
          : "4px 4px 0 0 rgba(206, 206, 206, 0.5)",

        "&:hover, &:focus, > .toggle-menu:focus": {
          "> .toggle-menu": {
            visibility: "visible",
            opacity: 1,
          },
        },

        "@media screen and (min-width: 768px)": {
          maxWidth: "16rem",
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
          opacity: isDropdownActive ? 1 : 0,
          right: ".8rem",
          top: ".8rem",
          zIndex: 1,
          transition: "all .125s linear",
          backgroundColor: "#000",
          borderRadius: "100%",

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
            stroke: "primary",
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
          top: "40px",
          right: "5px",
          backgroundColor: "background",
          transition: "all .125s linear",
          boxShadow: "0px 5px 5px rgba(0,0,0,0.25)",
          gap: ".8rem",
          zIndex: 2,
          fontSize: "1.2rem",
          borderRadius: "5px",

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
        onClick={handleOnClick(item)}
        sx={{
          transition: "all .5s linear",
          opacity: isDropdownActive ? 0.5 : 1,
          backgroundColor: "rgba(206, 206, 206, 1)",
          borderRadius: "5px",
          boxSizing: "border-box",
        }}
        src={externalMetadata.image}
      />
    </Flex>
  )
}

export default CollectionItem
