import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { registerENSName, hasENSName } from "../utils/contracts";

export default function ENSRegistration() {
  const [ensName, setEnsName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const { isConnected, address } = useAccount();

  useEffect(() => {
    const checkENSStatus = async () => {
      if (isConnected && address) {
        try {
          if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const hasName = await hasENSName(address, provider);
            setAlreadyRegistered(hasName);
          }
        } catch (error) {
          console.error("Error checking ENS status:", error);
        }
      }
    };

    checkENSStatus();
  }, [isConnected, address]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isConnected || !ensName) return;

    // Check for existing registration first before setting loading state
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const hasName = await hasENSName(address, provider);
        if (hasName) {
          setError(
            "This address already has a registered ENS name. One address can only have one ENS name."
          );
          setAlreadyRegistered(true);
          return;
        }
      } catch (error) {
        console.error("Error checking ENS status:", error);
      }
    }

    setIsRegistering(true);
    setError("");
    setTxHash("");

    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tx = await registerENSName(ensName, signer);
        setTxHash(tx.hash);
        await tx.wait();
        setEnsName("");
        setAlreadyRegistered(true);
      }
    } catch (error) {
      setError(error.message || "Failed to register ENS name");
    } finally {
      setIsRegistering(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="border rounded-lg p-6 w-full max-w-md shadow-sm bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-black">Register ENS Name</h3>
      </div>

      {alreadyRegistered ? (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            This address already has a registered ENS name. One address can only
            have one ENS name.
          </p>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <input
              type="text"
              value={ensName}
              onChange={(e) => setEnsName(e.target.value)}
              placeholder="Enter your desired name"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 focus:ring-blue-500"
              disabled={isRegistering}
            />
          </div>

          <button
            type="submit"
            disabled={!ensName || isRegistering}
            className={`w-full py-2 px-4 rounded ${
              !ensName || isRegistering
                ? "bg-gray-100 text-gray-500"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 font-medium`}
          >
            {isRegistering ? "Registering..." : "Register Name"}
          </button>
        </form>
      )}

      {txHash && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            Name registered successfully!{" "}
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
    </div>
  );
}
