"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import {
  getTokenId,
  getUserRank,
  getReputationScore,
} from "../utils/contracts";
import Image from "next/image";

export default function SbtInfo() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tokenId, setTokenId] = useState(0);
  const [reputation, setReputation] = useState(0);
  const [loading, setLoading] = useState(true);

  const { address, isConnected } = useAccount();

  // Token URIs from SoulBoundToken.sol
  const tokenURIs = {
    human: "ipfs://QmUzKw3XyUFpPhUGtTuNX75wSrmz2YjtrA8qpsnCiQMvJ5",
    member: "ipfs://QmW6Lc7sMz1jDsd1xwfmjrBtULEcYmnPdxeq1SbaJzjpCL",
    voter: "ipfs://Qmdet6FeWFuwNGPjVvVRA4cN5uP673HmbVmQGDzvqgvuXA",
    organizer: "ipfs://QmXg1uCQWEZj2KRWuCsSfrqEKUSvL8FMwxAHzh7hYQoqff",
    leader: "ipfs://QmSRd4NB2S6F95zR3PvNru5WStibJGPiwWgxrNqULiF6yJ",
  };

  // Convert IPFS URL to HTTP gateway URL
  const getHttpUrl = (ipfsUrl, tokenLevel) => {
    if (!ipfsUrl) return null;

    // Extract the IPFS hash
    const hash = ipfsUrl.replace("ipfs://", "");

    // Map rank names to filenames
    const fileNames = {
      human: "human.png",
      member: "member.png",
      voter: "voter.png",
      organizer: "organizer.png",
      leader: "leader.png",
    };

    // Determine the appropriate filename based on level
    let fileName = "token.png";
    if (tokenLevel === 1) fileName = fileNames.human;
    if (tokenLevel === 2) fileName = fileNames.member;
    if (tokenLevel === 3) fileName = fileNames.voter;
    if (tokenLevel === 4) fileName = fileNames.organizer;
    if (tokenLevel === 5) fileName = fileNames.leader;

    // Primary gateway with fallback options
    return `https://ipfs.io/ipfs/${hash}?filename=${fileName}`;
  };

  // Handle image loading errors with fallback gateways
  const handleImageError = (e) => {
    const img = e.target;
    const currentSrc = img.src;

    // If using ipfs.io, try cloudflare-ipfs.com
    if (currentSrc.includes("ipfs.io")) {
      const newSrc = currentSrc.replace("ipfs.io", "cloudflare-ipfs.com");
      img.src = newSrc;
    }
    // If using cloudflare, try dweb.link
    else if (currentSrc.includes("cloudflare-ipfs.com")) {
      const newSrc = currentSrc.replace("cloudflare-ipfs.com", "dweb.link");
      img.src = newSrc;
    }
    // If all gateways fail, use placeholder
    else {
      img.onerror = null; // Prevent infinite fallback loop
      img.src = "/placeholder-token.png";
    }
  };

  useEffect(() => {
    async function fetchTokenData() {
      if (isConnected && address) {
        setLoading(true);
        try {
          if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            // Get token ID
            const id = await getTokenId(address, provider);
            setTokenId(Number(id));

            // Get reputation for rank
            const score = await getReputationScore(address, provider);
            setReputation(Number(score));
          }
        } catch (error) {
          console.error("Error fetching token data:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchTokenData();
  }, [isConnected, address]);

  const { rank, level } = getUserRank(reputation);

  // Determine which token URI to use based on rank
  const getTokenImageUrl = () => {
    if (level === 5) return getHttpUrl(tokenURIs.leader, level);
    if (level === 4) return getHttpUrl(tokenURIs.organizer, level);
    if (level === 3) return getHttpUrl(tokenURIs.voter, level);
    if (level === 2) return getHttpUrl(tokenURIs.member, level);
    if (level === 1) return getHttpUrl(tokenURIs.human, level);
    return null;
  };

  const tokenImageUrl = getTokenImageUrl();

  return (
    <div className="border rounded-lg p-6 w-full max-w-md shadow-sm bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-black">
          Soul Bound Tokens (SBTs)
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? "Hide Details" : "View Details"}
        </button>
      </div>

      {isConnected ? (
        <div className="mb-4">
          {loading ? (
            <p className="text-black">Loading your token...</p>
          ) : tokenImageUrl ? (
            <div className="space-y-4">
              <h4 className="font-medium text-black">
                Your Current Token: {rank}
              </h4>
              <div className="flex justify-center">
                <div className="relative w-64 h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={tokenImageUrl}
                    alt={`${rank} Token`}
                    className="object-cover"
                    style={{ width: "100%", height: "100%" }}
                    onError={handleImageError}
                  />
                </div>
              </div>
              <p className="text-gray-800">
                This is your {rank} token. It represents your identity and
                reputation in DiigooDAO.
              </p>
            </div>
          ) : (
            <p className="text-gray-800">
              You don&apos;t have any SBT tokens yet. Get verified to receive
              your first token!
            </p>
          )}
        </div>
      ) : (
        <p className="text-gray-800 mb-4">
          Connect your wallet to view your Soul Bound Token.
        </p>
      )}

      {isExpanded && (
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium mb-2 text-black">How SBTs Work</h4>
            <p className="text-gray-800">
              Unlike regular NFTs, Soul Bound Tokens cannot be transferred or
              sold. They are permanently bound to your wallet address and
              represent your reputation and contributions to the DAO.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-black">Promotion System</h4>
            <p className="text-gray-800">
              As you participate in the DAO, your SBT is automatically promoted
              to higher ranks based on your reputation score:
            </p>
            <ul className="mt-2 space-y-2">
              <li className="flex items-start">
                <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs font-medium">
                  1
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">Human</span> - Awarded after
                  verification (10 reputation points)
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs font-medium">
                  2
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">Member</span> - Requires 30
                  reputation points
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs font-medium">
                  3
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">Voter</span> - Requires 60
                  reputation points
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs font-medium">
                  4
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">Organizer</span> - Requires 100
                  reputation points
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs font-medium">
                  5
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">Leader</span> - Requires 200
                  reputation points
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-black">Earning Reputation</h4>
            <ul className="space-y-1 text-gray-800">
              <li>• Verification: +10 points</li>
              <li>• Completing tasks: +20 points</li>
              <li>• Voting in DAO decisions: +30 points</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-black">Benefits</h4>
            <p className="text-gray-800">
              Higher-ranked members gain increased voting power, access to
              exclusive DAO activities, and potential rewards in future
              ecosystem developments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
