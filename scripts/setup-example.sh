#!/usr/bin/sh

# Example for script for setting up a farm.

set -eux 

# Path to the binary
BIN="../target/debug/staking_cli"

# Farm address 
FARM=

# Only needed if the farm was not created yet.
REWARD_MINT=AdtE1SLEVy4sDtw8hTBGrtgY1AXmGsZJu876b17weWq

if [ -z "$FARM" ]; then
  echo "Farm not address not set. Creating a new one."
  FARM=$($BIN farm create $REWARD_MINT | sed -n 's/.*at//p')
  echo "Created new farm: $FARM"
fi

# Fund farm reward pot
$BIN farm reward deposit $FARM 1000

# Add a new creator to the whitelist
CREATOR_ADDRESS=
$BIN farm whitelist add $FARM $CREATOR_ADRESS

# Add new locks to a farm
# Create a JSON file with the locks.
# The file should contain an *array* of:
# { 
#   // How long the lock will last (seconds)
#   "duration": 0,
#   // How long until an NFT can be staked again after using this lock (seconds)
#   "cooldown": 0,
#   // Bonus percentage points that will increase the staking reward (0-100)
#   "bonus_factor": 0,
# }
echo "[ { \"duration\": 86400, \"cooldown\": 0, \"bonus_factor\": 25 } ]" > locks.json
$BIN farm lock add $FARM locks.json
