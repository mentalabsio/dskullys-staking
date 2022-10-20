import { Flex, Text } from "theme-ui"

type ProgressBarProps = {
  totalStaked: number
}

const ProgressBar = ({ totalStaked }: ProgressBarProps) => {
  const stakedPercent = totalStaked / 5555
  return (
    <Flex
      sx={{
        width: "100%",
        flexDirection: "column",
      }}
    >
      <Text>
        Total staked: <Text> {totalStaked}</Text>
      </Text>
      <Flex
        sx={{
          width: "100%",
          backgroundColor: "primary",
          height: "40px",
          opacity: 0.6,
          borderRadius: "10px",
          position: "relative",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Flex
          sx={{
            position: "absolute",
            width: `${stakedPercent}%`,
            height: "40px",
            borderTopLeftRadius: "10px",
            borderBottomLeftRadius: "10px",
            backgroundColor: "highlight",
            left: 0,
            top: 0,
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: "0.5rem",
            color: "text",
          }}
        ></Flex>
        <Text
          sx={{
            position: "absolute",
            right: "-5rem",
            color: "highlight",
            fontWeight: "bold",
          }}
        >
          {stakedPercent.toFixed(1)}%
        </Text>
      </Flex>
    </Flex>
  )
}

export default ProgressBar
