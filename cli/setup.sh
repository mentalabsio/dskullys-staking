#!/usr/bin/sh
# Example for script for setting up a farm.

set -ue 

# Config
# Path to the binary
BIN="../target/debug/staking_cli"
FARM=
# Only needed if the farm was not created yet.
REWARD_MINT=AdtE1SLEVy4sDtw8hTBGrtgY1AXmGsZJu876b17weWq

if [ -z "$FARM" ]; then
  echo "Farm not address not set. Creating a new one."
  FARM=$($BIN farm create $REWARD_MINT | sed -n 's/.*at//p')
  echo "Created new farm: $FARM"
fi

# Fund farm reward pot
# $BIN farm reward deposit $FARM 1000
