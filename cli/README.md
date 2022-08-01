# Staking CLI

### Usage
```sh
# Create a new farm.
# By default, the farm authority will be the keypair configured at ~/.config/solana/cli/config.yml
# You can override this with the --keypair argument.
staking farm create <REWARD_MINT>

# List all the farms you can manage.
staking farm list

# Fund farm's reward pot. This already accounts for decimals, so if the token 
# had 6 decimals it would fund 1000e6 tokens.
staking farm fund <FARM_ADDRESS> 1000

# Whitelist a new creator address
staking farm wl add <FARM_ADDRESS> <ADDRESS_TO_WHITELIST>

# TODO: Add locks to a farm.
# staking farm lock add locks.json
```
