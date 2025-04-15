"use client";

import { useState, useEffect } from "react";
import { useAccount, useDisconnect, useEnsName } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import {
  getReputationScore,
  getVerificationStatus,
  getENSName,
  getTokenBalance,
  getUserRank,
} from "../utils/contracts";

export default function UserProfile() {
  const [reputation, setReputation] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [contractEnsName, setContractEnsName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showRankInfo, setShowRankInfo] = useState(false);

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });

  useEffect(() => {
    // Reset state when address changes
    setContractEnsName("");
    setReputation(0);
    setIsVerified(false);
    setTokenBalance(0);

    async function fetchUserData() {
      if (isConnected && address) {
        setLoading(true);
        try {
          if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            const score = await getReputationScore(address, provider);
            setReputation(Number(score));

            const verified = await getVerificationStatus(address, provider);
            setIsVerified(verified);

            const balance = await getTokenBalance(address, provider);
            setTokenBalance(Number(balance));

            const ensFromContract = await getENSName(address, provider);
            setContractEnsName(ensFromContract || ""); // Explicitly set to empty string if null or undefined
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setContractEnsName(""); // Ensure ENS is cleared on error
        } finally {
          setLoading(false);
        }
      }
    }

    fetchUserData();
  }, [isConnected, address]);

  const displayName =
    contractEnsName ||
    ensName ||
    (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "");
  const { rank } = getUserRank(reputation);

  return (
    <div className="border rounded-lg p-6 w-full max-w-md shadow-sm bg-white">
      {!isConnected ? (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4 text-black">
            Connect to DiigooDAO
          </h3>
          <div className="inline-block">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                return (
                  <div className={`${mounted ? "opacity-100" : "opacity-0"}`}>
                    {(() => {
                      if (!mounted || !account || !chain) {
                        return (
                          <button
                            onClick={openConnectModal}
                            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none"
                          >
                            Connect Wallet
                          </button>
                        );
                      }
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      ) : loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-black">Profile</h3>
            <button
              onClick={() => disconnect()}
              className="text-sm px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              Disconnect
            </button>
          </div>

          <div className="space-y-3 mb-6">
            <div>
              <p className="text-sm text-gray-600 font-medium">Address</p>
              <p className="font-medium text-black">{displayName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-medium">Reputation</p>
              <p className="font-medium text-black">{reputation} points</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-medium">Rank</p>
              <div className="flex items-center">
                <p className="font-medium text-black">{rank}</p>
                <button
                  onClick={() => setShowRankInfo(!showRankInfo)}
                  className="ml-2 text-xs text-blue-600 hover:underline"
                >
                  {showRankInfo ? "Hide Info" : "View Ranks"}
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-medium">SBT Tokens</p>
              <p className="font-medium text-black">{tokenBalance}</p>
            </div>
          </div>

          {showRankInfo && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm">
              <h4 className="font-medium mb-2 text-black">DAO Ranks:</h4>
              <ul className="space-y-1 text-gray-800">
                <li>• Human: 10 score (after verification)</li>
                <li>• Member: 30 score</li>
                <li>• Voter: 60 score</li>
                <li>• Organizer: 100 score</li>
                <li>• Leader: 200 score</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
