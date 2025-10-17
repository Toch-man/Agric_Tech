import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { wagmiContractConfig } from "../../contracts/contract";
import { useWaitForTransactionReceipt } from "wagmi";
import Header from "../../layout/header";
import { useNavigate } from "react-router-dom";

const RequestRole = () => {
  const [role, setRole] = useState("");
  const [location, set_location] = useState("");
  const [name, set_name] = useState("");
  const { address, isConnected } = useAccount();
  const [txHash, set_txHash] = useState<`0x${string}` | undefined>(undefined);
  const [is_submitting, set_is_submitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false); // New dialog state
  const roles = ["Farmer", "Transporter", "Store-Manager"];
  const navigate = useNavigate(); // For navigation

  const { writeContractAsync } = useWriteContract();

  const {
    isSuccess: isConfirmed,
    isError: isConfirmationError,
    error: confirmationError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
    query: { enabled: !!txHash, retry: 3, retryDelay: 1000 },
  });

  const apply = useMutation({
    mutationFn: async (data: {
      name: string;
      location: string;
      role: string;
    }) => {
      try {
        if (!isConnected || !address) return;
        set_is_submitting(true);
        const hash = await writeContractAsync({
          ...wagmiContractConfig,
          functionName: "request_for_role",
          args: [data.name, BigInt(roles.indexOf(data.role)), data.location],
        });
        set_txHash(hash);
        set_is_submitting(false);
      } catch (error) {
        console.log(error);
        set_is_submitting(false);
      }
    },
  });

  const get_button_message = () => {
    if (apply.isPending || is_submitting) return "Preparing...";
    return "Apply";
  };

  const get_status_message = () => {
    if (isConfirmed) return "Transaction successful";
    if (isConfirmationError) return "Transaction failed, try again";
    if (apply.isPending && !txHash) return "Preparing transaction...";
    if (txHash && !isConfirmationError && confirmationError)
      return "Confirming transaction...";
  };

  //  Show dialog box once transaction is confirmed
  if (isConfirmed && !showDialog) {
    setShowDialog(true);
  }

  return (
    <Header>
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4 relative">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Request a Role
          </h1>

          {/* FORM SECTION */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              apply.mutate({ name: name, location: location, role: role });
            }}
            className="space-y-5"
          >
            {/* ✏️ Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => set_name(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/*  Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => set_location(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your location"
                required
              />
            </div>

            {/*  Role Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">-- Select a role --</option>
                {roles.map((role, i) => (
                  <option key={i} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* ⛓️ Transaction Info */}
            {txHash && (
              <div className="text-sm text-gray-600 mt-2">
                <p className="break-words text-xs text-gray-500">
                  Tx Hash: {txHash}
                </p>
                <p className="mt-1 font-medium">{get_status_message()}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={apply.isPending || is_submitting}
              className={`w-full py-2 rounded-lg font-semibold text-white transition ${
                apply.isPending || is_submitting
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {get_button_message()}
            </button>
          </form>
        </div>

        {/*  Dialog box after success */}
        {showDialog && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center relative">
              {/* ⬅️ Back arrow */}
              <button
                className="absolute top-3 left-3 text-gray-600 hover:text-gray-900"
                onClick={() => navigate("/homePage")}
              >
                ←
              </button>

              {/*  Success message */}
              <h2 className="text-lg font-bold text-green-600 mb-2">
                🎉 Request Submitted!
              </h2>
              <p className="text-gray-700 mb-4 text-sm">
                Your role request has been successfully submitted. You will be
                notified once its approved.
              </p>

              {/* Go back button */}
              <button
                onClick={() => navigate("/homePage")}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
              >
                Go Back Home
              </button>
            </div>
          </div>
        )}
      </div>
    </Header>
  );
};

export default RequestRole;
