import Header from "../layout/header";
import { useWriteContract } from "wagmi";
import { useState, useEffect } from "react";
import { wagmiContractConfig } from "../contracts/contract";
import { useWaitForTransactionReceipt } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";

export default function RegisterFarm() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const [name, setname] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [location, setlocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { writeContractAsync } = useWriteContract();

  const {
    isSuccess: isConfirmed,
    isError: isConfirmationError,
    error: confirmationError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
    query: {
      enabled: !!txHash,
      retry: 3,
      retryDelay: 1000,
    },
  });

  useEffect(() => {
    if (isConfirmed) {
      setIsSubmitting(false);
      // Add a small delay to show success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    }
  }, [isConfirmed, navigate]);

  useEffect(() => {
    if (isConfirmationError) {
      setIsSubmitting(false);
      console.error("Transaction confirmation error:", confirmationError);
    }
  }, [isConfirmationError, confirmationError]);

  const register = useMutation({
    mutationFn: async (formData: { name: string; location: string }) => {
      try {
        setIsSubmitting(true);

        // Check if wallet is connected
        if (!isConnected) {
          throw new Error("Please connect your wallet first");
        }

        console.log("Attempting to write contract...");

        const hash = await writeContractAsync({
          ...wagmiContractConfig,
          functionName: "registerFarmer",
          args: [formData.name, formData.location],
        });

        console.log("Transaction hash:", hash);
        setTxHash(hash);
        return hash;
      } catch (error: any) {
        setIsSubmitting(false);

        // Handle specific MetaMask errors
        if (error?.code === 4001) {
          throw new Error("Transaction rejected by user");
        } else if (error?.code === -32002) {
          throw new Error(
            "MetaMask is already processing a request. Please check MetaMask."
          );
        } else if (error?.message?.includes("User rejected")) {
          throw new Error("Transaction rejected by user");
        }

        throw error;
      }
    },

    onError: (error: any) => {
      console.error("Registration error:", error);
      setIsSubmitting(false);
      setTxHash(undefined);

      // You can show a toast notification here
      alert(`Error: ${error.message || "Registration failed"}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim() || !location.trim()) {
      alert("Please fill in all fields");
      return;
    }

    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    // Clear previous transaction hash
    setTxHash(undefined);

    // Trigger the mutation
    register.mutate({ name: name.trim(), location: location.trim() });
  };

  const getButtonText = () => {
    if (isSubmitting) return "Processing...";
    if (register.isPending) return "Preparing...";
    return "Register";
  };

  const getStatusMessage = () => {
    if (register.isPending && !txHash) return "Preparing transaction...";
    if (txHash && !isConfirmed && !isConfirmationError)
      return "Waiting for confirmation...";
    if (isConfirmationError) return "Transaction failed. Please try again.";
    if (isConfirmed) return "Success! Redirecting to dashboard...";
    return null;
  };

  return (
    <Header>
      <div className="flex mx-auto justify-center p-[50px] bg-white lg:w-[500px] lg:h-[400px] shadow-2xl border-black-600">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block mb-2 font-medium">
              Farm Name:
            </label>
            <input
              className="w-full p-2 border-2 border-green-300 rounded"
              id="name"
              value={name}
              onChange={(e) => setname(e.target.value)}
              type="text"
              placeholder="Enter your farm name"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="address" className="block mb-2 font-medium">
              Farm Location:
            </label>
            <input
              className="w-full p-2 border-2 border-green-300 rounded"
              id="address"
              value={location}
              onChange={(e) => setlocation(e.target.value)}
              type="text"
              placeholder="Enter your farm location"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Status Messages */}
          {getStatusMessage() && (
            <div
              className={`p-3 rounded mb-4 ${
                isConfirmationError
                  ? "bg-red-100 text-red-700"
                  : isConfirmed
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {getStatusMessage()}
            </div>
          )}

          {/* Transaction Hash */}
          {txHash && (
            <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
              <p>Transaction Hash:</p>
              <p className="break-all font-mono">{txHash}</p>
            </div>
          )}

          {/* Error Display */}
          {register.error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {(register.error as any)?.message || "An error occurred"}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || register.isPending || !isConnected}
            className={`w-full h-[50px] rounded font-medium transition-colors ${
              isSubmitting || register.isPending || !isConnected
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {getButtonText()}
          </button>

          {!isConnected && (
            <p className="text-red-500 text-sm mt-2 text-center">
              Please connect your wallet to register
            </p>
          )}
        </form>
      </div>
    </Header>
  );
}
