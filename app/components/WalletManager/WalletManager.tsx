/** @jsxImportSource theme-ui */
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Flex } from "theme-ui"

const WalletManager = () => {
  const wallet = useWallet()

  return (
    <Flex
      sx={{
        justifyContent: "center",
        alignItems: "center",

        ".wallet-adapter-dropdown": {
          display: "flex",
          justifyContent: "center",
        },
      }}
    >
      <Flex
        sx={{
          justifyContent: "center",
        }}
      >
        {wallet?.publicKey ? (
          <WalletMultiButton
            sx={{
              display: "flex",
              color: "heading",
              background: "primary",
              border: "1px solid transparent",
              transition: "all .125s linear",
              alignItems: "center",
              borderColor: "primary",
              fontWeight: "normal",
              borderRadius: "5px",
              fontSize: "14px",
              fontFamily: "primary",
              padding: "8px 16px",
              lineHeight: "inherit",
              height: "unset",

              "&:not(:disabled):hover": {
                cursor: "pointer",
                color: "primary",
                backgroundColor: "text",
              },

              "&:hover": {
                background: "unset",
                backgroundImage: "unset!important",
                color: "primary",
                cursor: "pointer",
              },
            }}
          ></WalletMultiButton>
        ) : (
          <WalletMultiButton
            sx={{
              display: "flex",
              color: "heading",
              background: "primary",
              border: "1px solid transparent",
              transition: "all .125s linear",
              alignItems: "center",
              borderColor: "primary",
              fontWeight: "normal",
              borderRadius: "5px",
              fontSize: "14px",
              fontFamily: "primary",
              padding: "8px 16px",
              lineHeight: "inherit",
              height: "unset",

              "&:not(:disabled):hover": {
                cursor: "pointer",
                color: "primary",
                backgroundColor: "text",
              },

              "&:disabled": {
                bg: "background",
                cursor: "not-allowed",
                opacity: 0.3,
              },
            }}
          ></WalletMultiButton>
        )}
      </Flex>
    </Flex>
  )
}

export default WalletManager
