import { ethers } from "ethers";

const REPUTATION_SYSTEM_ADDRESS = "0x349ed98f8715214ee00371ed3acb6dff1f8d7ef6";
const SBT_ADDRESS = "0x38d06f163d8a6BCC91D39Cf3d6952f8d650618DB";

// ABI for the ReputationSystem contract
const REPUTATION_SYSTEM_ABI = [
  "function reputationScores(address) view returns (uint256)",
  "function isVerified(address) view returns (bool)",
  "function lastTaskCompletion(address) view returns (uint256)",
  "function lastVote(address) view returns (uint256)",
  "function hasCompletedTask(address) view returns (bool)",
  "function tokenIds(address) view returns (uint256)",
  "function getENSName(address) view returns (string)",
  "function ensNames(address) view returns (string)",
  "function ensNameToAddress(string) view returns (address)",
  "function verifyAccount() external",
  "function completeTask() external",
  "function voteInDAO() external",
  "function registerENSName(string) external",
  "event ENSNameRegistered(address indexed user, string name)",
  "event AccountVerified(address indexed user)",
  "event TaskCompleted(address indexed user)",
  "event VoteSubmitted(address indexed user)",
];

// ABI for the SoulBoundToken contract
const SBT_ABI = [
  "function tokenURI(uint256) view returns (string)",
  "function balanceOf(address) view returns (uint256)",
  "function ownerOf(uint256) view returns (address)",
];

export async function getReputationSystem(providerOrSigner) {
  return new ethers.Contract(
    REPUTATION_SYSTEM_ADDRESS,
    REPUTATION_SYSTEM_ABI,
    providerOrSigner
  );
}

export async function getSBT(providerOrSigner) {
  return new ethers.Contract(SBT_ADDRESS, SBT_ABI, providerOrSigner);
}

export async function getReputationScore(address, provider) {
  const contract = await getReputationSystem(provider);
  return await contract.reputationScores(address);
}

export async function getVerificationStatus(address, provider) {
  const contract = await getReputationSystem(provider);
  return await contract.isVerified(address);
}

export async function getENSName(address, provider) {
  const contract = await getReputationSystem(provider);
  return await contract.getENSName(address);
}

export async function getTokenId(address, provider) {
  const contract = await getReputationSystem(provider);
  return await contract.tokenIds(address);
}

export async function getTokenBalance(address, provider) {
  const contract = await getSBT(provider);
  return await contract.balanceOf(address);
}

export async function verifyAccount(signer) {
  const contract = await getReputationSystem(signer);
  return await contract.verifyAccount();
}

export async function completeTask(signer) {
  const contract = await getReputationSystem(signer);
  return await contract.completeTask();
}

export async function voteInDAO(signer) {
  const contract = await getReputationSystem(signer);
  return await contract.voteInDAO();
}

export async function registerENSName(ensName, signer) {
  const contract = await getReputationSystem(signer);
  return await contract.registerENSName(ensName);
}

export async function hasENSName(address, provider) {
  const contract = await getReputationSystem(provider);
  const ensName = await contract.getENSName(address);
  return ensName && ensName !== "";
}

// Get the user's rank based on reputation
export function getUserRank(reputation) {
  if (reputation >= 200) return { rank: "Leader", level: 5 };
  if (reputation >= 100) return { rank: "Organizer", level: 4 };
  if (reputation >= 60) return { rank: "Voter", level: 3 };
  if (reputation >= 30) return { rank: "Member", level: 2 };
  if (reputation >= 10) return { rank: "Human", level: 1 };
  return { rank: "Unverified", level: 0 };
}
