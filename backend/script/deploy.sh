#!/bin/bash

# This script deploys the ReputationSystem contract to Sepolia testnet

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY environment variable is not set"
    echo "Please set your private key: export PRIVATE_KEY=your_private_key_here"
    exit 1
fi

# Check if RPC_URL is set
if [ -z "$RPC_URL" ]; then
    # Default to Infura or Alchemy if available
    if [ -n "$INFURA_API_KEY" ]; then
        RPC_URL="https://sepolia.infura.io/v3/$INFURA_API_KEY"
    elif [ -n "$ALCHEMY_API_KEY" ]; then
        RPC_URL="https://eth-sepolia.g.alchemy.com/v2/$ALCHEMY_API_KEY"
    else
        echo "Error: No RPC_URL, INFURA_API_KEY, or ALCHEMY_API_KEY environment variables are set"
        echo "Please set one of them to connect to Sepolia testnet"
        exit 1
    fi
fi

# Print deployment information
echo "Deploying contracts to Sepolia testnet..."
echo "RPC URL: $RPC_URL"

# Run the forge script
forge script script/Deploy.s.sol:DeployScript \
    --rpc-url $RPC_URL \
    --broadcast \
    --verify \
    -vvv

echo "Deployment completed!" 