"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import {
  verifyAccount,
  completeTask,
  voteInDAO,
  getReputationSystem,
} from "../utils/contracts";

export default function UserActions({ isVerified }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTaskCompleting, setIsTaskCompleting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [taskCooldownRemaining, setTaskCooldownRemaining] = useState(0);
  const [voteCooldownRemaining, setVoteCooldownRemaining] = useState(0);

  const { isConnected, address } = useAccount();

  const formatCooldown = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Check cooldown timers when component loads and when account changes
  useEffect(() => {
    if (isConnected && address) {
      checkCooldowns();
    }
  }, [isConnected, address]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTaskCooldownRemaining((prev) => Math.max(0, prev - 1));
      setVoteCooldownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Function to check cooldowns from backend contract
  const checkCooldowns = async () => {
    if (!window.ethereum || !address) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = await getReputationSystem(provider);

      // Get last task completion timestamp
      const lastTaskTimestamp = await contract.lastTaskCompletion(address);
      if (lastTaskTimestamp.toNumber() > 0) {
        const now = Math.floor(Date.now() / 1000);
        const taskElapsed = now - lastTaskTimestamp.toNumber();
        const taskCooldown = 2 * 60; // 2 minutes cooldown

        if (taskElapsed < taskCooldown) {
          setTaskCooldownRemaining(taskCooldown - taskElapsed);
        } else {
          setTaskCooldownRemaining(0);
        }
      }

      // Get last vote timestamp
      const lastVoteTimestamp = await contract.lastVote(address);
      if (lastVoteTimestamp.toNumber() > 0) {
        const now = Math.floor(Date.now() / 1000);
        const voteElapsed = now - lastVoteTimestamp.toNumber();
        const voteCooldown = 5 * 60; // 5 minutes cooldown

        if (voteElapsed < voteCooldown) {
          setVoteCooldownRemaining(voteCooldown - voteElapsed);
        } else {
          setVoteCooldownRemaining(0);
        }
      }
    } catch (error) {
      console.error("Error checking cooldowns:", error);
    }
  };

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
    if (!isConnected || !isVerified) return;

    // Refresh cooldowns first to ensure we're not starting a tx that will fail
    await checkCooldowns();

    if (taskCooldownRemaining > 0) {
      setError(
        `Please wait for the cooldown period to expire: ${formatCooldown(
          taskCooldownRemaining
        )} remaining`
      );
      return;
    }

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
        // Set the correct cooldown time
        setTaskCooldownRemaining(2 * 60); // 2 minutes
        await checkCooldowns();
      }
    } catch (error) {
      console.error("Task completion error:", error.message);

      // Check if the error is related to cooldown
      if (
        error.message.includes("cooldown") ||
        error.message.includes("wait")
      ) {
        // Try to extract remaining time from error message using regex
        const timeMatch = error.message.match(
          /(\d+)\s*(seconds|minutes|hours)/i
        );
        if (timeMatch) {
          let seconds = parseInt(timeMatch[1]);
          if (timeMatch[2].toLowerCase().includes("minute")) {
            seconds *= 60;
          } else if (timeMatch[2].toLowerCase().includes("hour")) {
            seconds *= 3600;
          }
          setTaskCooldownRemaining(seconds);
          setError(
            `Cooldown period not elapsed. Please wait ${formatCooldown(
              seconds
            )}.`
          );
        } else {
          // If we can't extract time, check with the blockchain
          await checkCooldowns();
          setError(
            "Cooldown period not elapsed. Please wait before completing another task."
          );
        }
      } else {
        setError(error.message || "Failed to complete task");
      }
    } finally {
      setIsTaskCompleting(false);
    }
  };

  const handleVote = async () => {
    if (!isConnected || !isVerified) return;

    // Refresh cooldowns first to ensure we're not starting a tx that will fail
    await checkCooldowns();

    if (voteCooldownRemaining > 0) {
      setError(
        `Please wait for the cooldown period to expire: ${formatCooldown(
          voteCooldownRemaining
        )} remaining`
      );
      return;
    }

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
        // Set the correct cooldown time
        setVoteCooldownRemaining(5 * 60); // 5 minutes
        await checkCooldowns();
      }
    } catch (error) {
      console.error("Vote error:", error.message);

      // Check if the error is related to cooldown
      if (
        error.message.includes("cooldown") ||
        error.message.includes("wait")
      ) {
        // Try to extract remaining time from error message using regex
        const timeMatch = error.message.match(
          /(\d+)\s*(seconds|minutes|hours)/i
        );
        if (timeMatch) {
          let seconds = parseInt(timeMatch[1]);
          if (timeMatch[2].toLowerCase().includes("minute")) {
            seconds *= 60;
          } else if (timeMatch[2].toLowerCase().includes("hour")) {
            seconds *= 3600;
          }
          setVoteCooldownRemaining(seconds);
          setError(
            `Cooldown period not elapsed. Please wait ${formatCooldown(
              seconds
            )}.`
          );
        } else {
          // If we can't extract time, check with the blockchain
          await checkCooldowns();
          setError(
            "Cooldown period not elapsed. Please wait before voting again."
          );
        }
      } else {
        setError(error.message || "Failed to vote");
      }
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
            disabled={!isVerified || isTaskCompleting}
            className={`w-full py-2 px-4 rounded ${
              !isVerified
                ? "bg-gray-100 text-gray-500"
                : isTaskCompleting
                ? "bg-blue-400 text-white"
                : taskCooldownRemaining > 0
                ? "bg-yellow-100 text-yellow-800"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 font-medium`}
          >
            {isTaskCompleting
              ? "Completing..."
              : taskCooldownRemaining > 0
              ? `Cooldown: ${formatCooldown(taskCooldownRemaining)}`
              : "Complete Task (+20 points)"}
          </button>
          <p className="mt-1 text-sm text-gray-800">
            Complete tasks to earn reputation.
          </p>
        </div>

        <div>
          <button
            onClick={handleVote}
            disabled={!isVerified || isVoting}
            className={`w-full py-2 px-4 rounded ${
              !isVerified
                ? "bg-gray-100 text-gray-500"
                : isVoting
                ? "bg-blue-400 text-white"
                : voteCooldownRemaining > 0
                ? "bg-yellow-100 text-yellow-800"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 font-medium`}
          >
            {isVoting
              ? "Voting..."
              : voteCooldownRemaining > 0
              ? `Cooldown: ${formatCooldown(voteCooldownRemaining)}`
              : "Vote in DAO (+30 points)"}
          </button>
          <p className="mt-1 text-sm text-gray-800">
            Vote on proposals to earn reputation.
          </p>
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
