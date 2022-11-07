import { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { Box } from "theme-ui"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

const chartOptions: ApexOptions = {
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 300,
        },
        legend: {
          show: false,
        },
      },
    },
    {
      breakpoint: 4096,
      options: {
        chart: {
          width: 300,
        },
        legend: {
          show: false,
        },
      },
    },
  ],

  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false,
  },
  stroke: {
    show: false,
    curve: "smooth" as "smooth",
    lineCap: "butt" as "butt",
    colors: undefined,
    width: 0,
    dashArray: 0,
  },
  colors: [],
  labels: [],

  tooltip: {
    fillSeriesColor: false,
    y: {
      formatter: (val) => val.toFixed(2) + "%",
    },
    style: {
      fontFamily: "AvertaStd-Regular",
    },
    marker: {
      show: false,
    },
    custom: function ({ series, seriesIndex, dataPointIndex, w }) {
      return (
        '<div class="tooltip">' +
        w.globals.labels[seriesIndex] +
        ": " +
        series[seriesIndex].toFixed(2) +
        "%</div>"
      )
    },
  },
}

type Props = {
  totalStaked: number
}

const Donut = ({ totalStaked }: Props) => {
  const [series, setSeries] = useState([])
  const [config, setConfig] = useState(null)

  /** We need to use state & effects because Apex Chart is buggy asf. */
  useEffect(() => {
    if (totalStaked) {
      const colors = [],
        labels = []

      const config = [
        { label: "Staked", color: "rgba(241,241,241,1)" },
        { label: "Not staked", color: "rgba(241,241,241,0.5)" },
      ]

      config.map((object) => {
        labels.push(object.label)
        colors.push(object.color)
      })

      const chartConfig = { ...chartOptions, colors, labels }

      if (chartConfig) {
        const stakedPercentage = (totalStaked / 5555) * 100

        const series = [stakedPercentage + 10, 100 - stakedPercentage - 10]
        const mappedSeries = series.map((odd) => {
          return odd
        })

        setSeries(mappedSeries)
      } else {
        setSeries([1])
      }
      setConfig(chartConfig)
    } else {
      setConfig({ ...chartOptions, labels: ["Empty"], colors: ["#25272f"] })
    }
  }, [totalStaked])

  return (
    <Box
      sx={{
        ".apexcharts-canvas": {
          margin: "0 auto",
        },

        ".tooltip": {
          backgroundColor: "text",
          color: "primary",
          padding: "0.8rem 1.6rem",
          borderRadius: "5px",
        },
      }}
    >
      {config ? (
        <ReactApexChart options={config} series={series} type="donut" />
      ) : null}
    </Box>
  )
}

export default Donut
