# DiigooDAO Reputation System

![DiigooDAO](https://img.shields.io/badge/DiigooDAO-Reputation_System-blue)
![Solidity](https://img.shields.io/badge/Solidity-0.8.0-363636)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![License](https://img.shields.io/badge/License-MIT-green)

A decentralized reputation system that rewards community participation with Soul Bound Tokens (SBTs). This project includes both smart contracts and a frontend interface that allows users to earn reputation through various actions and receive non-transferable tokens that represent their status in the community.

<p align="center">
  <img src="https://github.com/user-attachments/assets/38502cc6-bc41-4a44-8676-489296f7d9db" alt="DiigooDAO Screenshot" width="600">
</p>

## Project Overview

DiigooDAO Reputation System is built to:

- Create a transparent, on-chain reputation system for DAO participants
- Issue non-transferable Soul Bound Tokens (SBTs) that represent a user's status
- Allow users to earn reputation by completing tasks and participating in governance
- Enable ENS name registration for easy identification within the ecosystem
- Provide visual representation of status through different token tiers

## Repository Structure

- `backend/`: Smart contracts written in Solidity using the Foundry framework
  - `ReputationSystem.sol`: Core contract that manages reputation points
  - `SoulBoundToken.sol`: ERC721-based implementation of non-transferable tokens
- `frontend/`: Next.js web application for interacting with the contracts
  - Built with React, Wagmi, Rainbow Kit, and Tailwind CSS
  - Allows users to connect wallets and perform reputation-earning actions

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v16+)
- [pnpm](https://pnpm.io/installation) (recommended) or npm
- [Foundry](https://getfoundry.sh/) for smart contract development
- A wallet with Sepolia ETH for testing (get from [Sepolia Faucet](https://sepoliafaucet.com/))

### Setup and Installation

#### Smart Contracts (Backend)

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   forge install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your private key and API keys
   ```

4. Run tests:

   ```bash
   forge test
   ```

5. Deploy to Sepolia (if needed):
   ```bash
   ./script/deploy.sh
   ```

#### Frontend Application

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Add your WalletConnect project ID
   ```

4. Run the development server:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployed Contracts

The system is currently deployed on Sepolia testnet:

- ReputationSystem: [0x349eD98f8715214ee00371ED3AcB6dFF1f8D7EF6](https://sepolia.etherscan.io/address/0x349eD98f8715214ee00371ED3AcB6dFF1f8D7EF6)
- SoulBoundToken: [0x38d06f163d8a6BCC91D39Cf3d6952f8d650618DB](https://sepolia.etherscan.io/address/0x38d06f163d8a6BCC91D39Cf3d6952f8d650618DB)

## User Flow

1. Connect your wallet to the application
2. Verify your account to receive your initial SBT (10 reputation points)
3. Complete tasks to earn additional points (20 points each)
4. Vote in DAO proposals (30 points each)
5. Register a custom ENS name for easy identification
6. As your reputation increases, your SBT automatically upgrades to reflect your new status

## Reputation Levels

- Human: 10-29 points
- Member: 30-59 points
- Voter: 60-99 points
- Organizer: 100-199 points
- Leader: 200+ points

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for secure smart contract libraries
- [Wagmi](https://wagmi.sh/) and [Rainbow Kit](https://www.rainbowkit.com/) for wallet integration
- [Foundry](https://getfoundry.sh/) for Ethereum development framework
