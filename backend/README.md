# DiigooDAO Reputation System

This repository contains the smart contracts for the DiigooDAO Reputation System, including a SoulBoundToken (SBT) implementation.

## Contracts

- `ReputationSystem.sol`: Manages reputation points for users and handles the SBT token promotion.
- `SoulBoundToken.sol`: A non-transferable NFT that reflects a user's reputation level.

## Development

### Prerequisites

- [Foundry](https://getfoundry.sh/)

### Setup

1. Clone the repository
2. Install dependencies:

```bash
forge install
```

3. Copy the example environment file:

```bash
cp .env.example .env
```

4. Update `.env` with your private key and API keys

### Running Tests

To run the tests:

```bash
forge test
```

For more detailed output:

```bash
forge test -vvv
```

### Deploying to Sepolia Testnet

1. Make sure your `.env` file is configured with the required variables:

   - `PRIVATE_KEY`: The private key of your deployer wallet
   - Either `INFURA_API_KEY`, `ALCHEMY_API_KEY`, or `RPC_URL` for connecting to Sepolia
   - `ETHERSCAN_API_KEY` (optional, for contract verification)

2. Run the deployment script:

```bash
./script/deploy.sh
```

This will:

- Deploy the `ReputationSystem` contract to Sepolia
- Automatically deploy the `SoulBoundToken` contract
- Output the contract addresses to the console
- Verify the contracts on Etherscan (if API key is provided)

### Interacting with the Deployed Contracts

After deployment, you can interact with the contracts using:

- Cast (Foundry's command-line tool)
- Etherscan
- Your frontend application

## Contract Functionality

### ReputationSystem

- `verifyAccount()`: Verify a user's account and mint their SBT (10 reputation points)
- `completeTask()`: Award reputation for completing tasks (20 points)
- `voteInDAO()`: Award reputation for voting in DAO proposals (30 points)
- `registerENSName(string)`: Register a user's ENS name for easier identification

### SoulBoundToken

- Non-transferable NFT (implements ERC721)
- Different token URIs based on reputation level:
  - Human: 0-30 points
  - Member: 31-60 points
  - Voter: 61-100 points
  - Organizer: 101-200 points
  - Leader: 201+ points

ReputationSystem Contract Address: 0x349eD98f8715214ee00371ED3AcB6dFF1f8D7EF6 (https://sepolia.etherscan.io/address/0x349eD98f8715214ee00371ED3AcB6dFF1f8D7EF6)
SoulBoundToken Contract Address: 0x38d06f163d8a6BCC91D39Cf3d6952f8d650618DB (https://sepolia.etherscan.io/address/0x38d06f163d8a6BCC91D39Cf3d6952f8d650618DB)
