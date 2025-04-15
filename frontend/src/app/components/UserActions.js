"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { verifyAccount, completeTask, voteInDAO } from "../utils/contracts";

export default function UserActions({ isVerified }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTaskCompleting, setIsTaskCompleting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [taskCooldownRemaining, setTaskCooldownRemaining] = useState(0);
  const [voteCooldownRemaining, setVoteCooldownRemaining] = useState(0);

  const { isConnected } = useAccount();

  const formatCooldown = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTaskCooldownRemaining((prev) => Math.max(0, prev - 1));
      setVoteCooldownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (!isConnected) return;
    setIsVerifying(true);
    setError("");
    setTxHash("");

    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tx = await verifyAccount(signer);
        setTxHash(tx.hash);
        await tx.wait();
      }
    } catch (error) {
      setError(error.message || "Failed to verify account");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!isConnected || !isVerified || taskCooldownRemaining > 0) return;
    setIsTaskCompleting(true);
    setError("");
    setTxHash("");

    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tx = await completeTask(signer);
        setTxHash(tx.hash);
        await tx.wait();
        setTaskCooldownRemaining(60);
      }
    } catch (error) {
      setError(error.message || "Failed to complete task");
    } finally {
      setIsTaskCompleting(false);
    }
  };

  const handleVote = async () => {
    if (!isConnected || !isVerified || voteCooldownRemaining > 0) return;
    setIsVoting(true);
    setError("");
    setTxHash("");

    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tx = await voteInDAO(signer);
        setTxHash(tx.hash);
        await tx.wait();
        setVoteCooldownRemaining(120);
      }
    } catch (error) {
      setError(error.message || "Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="border rounded-lg p-6 w-full max-w-md shadow-sm bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-black">Actions</h3>
      </div>

      <div className="space-y-4">
        <div>
          <button
            onClick={handleVerify}
            disabled={isVerified || isVerifying}
            className={`w-full py-2 px-4 rounded ${
              isVerified
                ? "bg-green-100 text-green-800"
                : isVerifying
                ? "bg-blue-400 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 font-medium`}
          >
            {isVerifying
              ? "Verifying..."
              : isVerified
              ? "Verified ✓"
              : "Verify Account"}
          </button>
          <p className="mt-1 text-sm text-gray-800">
            {isVerified
              ? "Your account is verified. You gained 10 reputation points."
              : "Verify your account to start earning reputation (10 points)."}
          </p>
        </div>

        <div>
          <button
            onClick={handleCompleteTask}
            disabled={
              !isVerified || isTaskCompleting || taskCooldownRemaining > 0
            }
            className={`w-full py-2 px-4 rounded ${
              !isVerified || taskCooldownRemaining > 0
                ? "bg-gray-100 text-gray-500"
                : isTaskCompleting
                ? "bg-blue-400 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 font-medium`}
          >
            {isTaskCompleting ? "Completing..." : "Complete Task (+20 points)"}
          </button>
          {taskCooldownRemaining > 0 ? (
            <p className="mt-1 text-sm text-gray-800">
              Cooldown: {formatCooldown(taskCooldownRemaining)}
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-800">
              Complete tasks to earn reputation.
            </p>
          )}
        </div>

        <div>
          <button
            onClick={handleVote}
            disabled={!isVerified || isVoting || voteCooldownRemaining > 0}
            className={`w-full py-2 px-4 rounded ${
              !isVerified || voteCooldownRemaining > 0
                ? "bg-gray-100 text-gray-500"
                : isVoting
                ? "bg-blue-400 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 font-medium`}
          >
            {isVoting ? "Voting..." : "Vote in DAO (+30 points)"}
          </button>
          {voteCooldownRemaining > 0 ? (
            <p className="mt-1 text-sm text-gray-800">
              Cooldown: {formatCooldown(voteCooldownRemaining)}
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-800">
              Vote on proposals to earn reputation.
            </p>
          )}
        </div>
      </div>

      {txHash && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            Transaction successful!{" "}
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View on Etherscan
            </a>
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {(isVerifying || isTaskCompleting || isVoting) && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Processing transaction...</p>
        </div>
      )}
    </div>
  );
}
