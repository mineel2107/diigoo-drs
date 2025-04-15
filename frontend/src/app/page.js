"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { getVerificationStatus } from "./utils/contracts";
import { ethers } from "ethers";
import UserProfile from "./components/UserProfile";
import UserActions from "./components/UserActions";
import SbtInfo from "./components/SbtInfo";
import ENSRegistration from "./components/ENSRegistration";

export default function Home() {
  const [isVerified, setIsVerified] = useState(false);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    async function checkVerificationStatus() {
      if (isConnected && address) {
        try {
          if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const verified = await getVerificationStatus(address, provider);
            setIsVerified(verified);
          }
        } catch (error) {
          setIsVerified(false);
        }
      }
    }

    checkVerificationStatus();
  }, [isConnected, address]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">DiigooDAO</h1>
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded">
              Deployed at Sepolia
            </span>
          </div>
          <div className="flex items-center" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Reputation System with Soul Bound Tokens
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Participate in the DAO, earn reputation, and advance your rank
            through non-transferable Soul Bound Tokens.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UserProfile />
          <UserActions isVerified={isVerified} />
          <SbtInfo />
          <ENSRegistration />
        </div>
      </main>
    </div>
  );
}
