# DiigooDAO Frontend

This is the frontend for the DiigooDAO Reputation System, a decentralized application that allows users to earn reputation through community participation and receive Soul Bound Tokens (SBTs) as recognition.

## Features

- Connect your wallet to interact with the DAO
- Verify your account to receive your initial Soul Bound Token
- Complete tasks to earn reputation points
- Vote in DAO proposals to earn additional reputation
- Register a custom ENS name for easy identification
- View your current reputation score and level
- Visualize your Soul Bound Token with different tiers based on reputation

## Technology Stack

- Next.js 14 (React framework)
- Wagmi & Rainbow Kit (Ethereum wallet integration)
- Ethers.js (Ethereum interaction)
- Tailwind CSS (Styling)

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Create a `.env` file with the required environment variables:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

4. Run the development server:

```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Deployed Contracts

The frontend interacts with the following contracts on Sepolia testnet:

- ReputationSystem: [0x349eD98f8715214ee00371ED3AcB6dFF1f8D7EF6](https://sepolia.etherscan.io/address/0x349eD98f8715214ee00371ED3AcB6dFF1f8D7EF6)
- SoulBoundToken: [0x38d06f163d8a6BCC91D39Cf3d6952f8d650618DB](https://sepolia.etherscan.io/address/0x38d06f163d8a6BCC91D39Cf3d6952f8d650618DB)

## Reputation Levels

The system features different levels based on reputation points:

- Human: 10-29 points
- Member: 30-59 points
- Voter: 60-99 points
- Organizer: 100-199 points
- Leader: 200+ points

Each level comes with a unique Soul Bound Token NFT that showcases your status in the community.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
