import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useSendTransaction } from "wagmi";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import Header from "../../layouts/header";
import { config } from "../../wagmi";
import { readContract } from "wagmi/actions";
import { useMutation } from "@tanstack/react-query";
import { wagmiContractConfig } from "../../contracts/contract";

type Request = {
  id: number;
  user_address: `0x${string}`;
  name: string;
  location: string;
  role: number;
  isApproved: boolean;
  exists: boolean;
};

const Approve = () => {
  const { address, isConnected } = useAccount();
  const [requests, setRequests] = useState<Request[]>([]);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [rejectTxHash, setRejectTxHash] = useState<`0x${string}` | undefined>(
    undefined
  );
  const { sendTransaction, data, isPending, isSuccess } = useSendTransaction();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { writeContractAsync } = useWriteContract();

  const { data: pending_request_count, refetch } = useReadContract({
    ...wagmiContractConfig,
    functionName: "get_pending_request_count",
    query: { enabled: !!address },
  });

  const {
    isSuccess: approveConfirmed,
    isError: approveError,
    isLoading: approvePending,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
    query: { enabled: !!txHash },
  });

  const {
    isSuccess: rejectConfirmed,
    isError: rejectError,
    isLoading: rejectPending,
  } = useWaitForTransactionReceipt({
    hash: rejectTxHash,
    confirmations: 1,
    query: { enabled: !!rejectTxHash },
  });

  useEffect(() => {
    async function fetchRequests() {
      if (!isConnected) return;
      const count = Number(pending_request_count || 0);
      if (count === 0) {
        setRequests([]);
        return;
      }

      // Fetch ALL pending users (up to a reasonable max, e.g., 100)
      const MAX_PENDING = 100;
      const calls = Array.from(
        { length: MAX_PENDING },
        (_, i) =>
          readContract(config, {
            ...wagmiContractConfig,
            functionName: "get_pending_request_byIndex",
            args: [BigInt(i + 1)],
          }).catch(() => null) // Catch errors for non-existent indices
      );

      const all = await Promise.all(calls);

      // Filter out null/deleted entries and map valid ones
      const values: Request[] = all
        .map((item: any, idx: number) => {
          if (!item || !item[5]) return null; // Check if exists flag is true

          return {
            id: idx + 1,
            user_address: item[0],
            name: item[1],
            location: item[2],
            role: Number(item[3]),
            isApproved: Boolean(item[4]),
            exists: Boolean(item[5]),
          };
        })
        .filter(
          (req): req is Request =>
            req !== null &&
            req.exists &&
            req.user_address !== "0x0000000000000000000000000000000000000000"
        );

      setRequests(values);
    }

    fetchRequests();
  }, [isConnected, pending_request_count, approveConfirmed, rejectConfirmed]);

  // Transaction receipts

  const approve = useMutation({
    mutationFn: async (data: { id: number; userAddress: `0x${string}` }) => {
      if (!isConnected) return;
      setIsSubmitting(true);
      try {
        const hash = await writeContractAsync({
          ...wagmiContractConfig,
          functionName: "approve_role",
          args: [BigInt(data.id)],
        });

        setTxHash(hash);

        // Fund account after approval
        try {
          await sendTransaction({
            to: data.userAddress,
            value: parseEther("0.10"),
          });
        } catch (err) {
          console.error("Funding error:", err);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const reject = useMutation({
    mutationFn: async (id: number) => {
      if (!isConnected) return;
      setIsSubmitting(true);
      try {
        const hash = await writeContractAsync({
          ...wagmiContractConfig,
          functionName: "reject_role",
          args: [BigInt(id)],
        });
        setRejectTxHash(hash);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  function getApproveStatus() {
    if (approvePending) return "Confirming approve transaction...";
    if (isPending) return "Funding account...";
    if (approveConfirmed) return "Approve confirmed!";
    if (isSuccess) return "Successfully funded account!";
    if (approveError) return "Approve failed. Try again.";
    return "";
  }

  function getRejectStatus() {
    if (rejectPending) return "Confirming reject transaction...";
    if (rejectConfirmed) return "Reject confirmed!";
    if (rejectError) return "Reject failed. Try again.";
    return "";
  }

  useEffect(() => {
    if (approveConfirmed || rejectConfirmed) {
      const timer = setTimeout(() => {
        refetch();
        setTxHash(undefined);
        setRejectTxHash(undefined);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [approveConfirmed, rejectConfirmed, refetch]);

  const getRoleLabel = (role: number): string => {
    switch (role) {
      case 0:
        return "Farmer";
      case 1:
        return "Transporter";
      case 2:
        return "Store Manager";
      default:
        return "Unknown";
    }
  };

  const getRoleBadgeColor = (role: number): string => {
    switch (role) {
      case 0:
        return "bg-green-100 text-green-800";
      case 1:
        return "bg-blue-100 text-blue-800";
      case 2:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Header>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Pending Role Requests
            </h1>
            <p className="text-gray-600 mt-2">
              Review and approve user role requests
            </p>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Total Pending:</span>{" "}
                {requests.length} request{requests.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Status Messages */}
          {(txHash || rejectTxHash) && (
            <div className="mb-6 space-y-3">
              {txHash && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-medium mb-2">
                    {getApproveStatus()}
                  </p>
                  <p className="text-xs text-green-700 break-all">
                    Tx: {txHash}
                  </p>
                  {data && (
                    <p className="text-xs text-green-700 break-all mt-1">
                      Funding Tx: {data}
                    </p>
                  )}
                </div>
              )}
              {rejectTxHash && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-medium mb-2">
                    {getRejectStatus()}
                  </p>
                  <p className="text-xs text-red-700 break-all">
                    Tx: {rejectTxHash}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-16 h-16 text-gray-300 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="text-lg font-medium">
                          No pending requests
                        </p>
                        <p className="text-sm mt-1">
                          New role requests will appear here
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((req, idx) => (
                    <tr
                      key={req.id}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{req.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono text-gray-600">
                          {req.user_address.slice(0, 6)}...
                          {req.user_address.slice(-4)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {req.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {req.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                            req.role
                          )}`}
                        >
                          {getRoleLabel(req.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                        <button
                          onClick={() =>
                            approve.mutate({
                              id: req.id,
                              userAddress: req.user_address,
                            })
                          }
                          disabled={isSubmitting}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => reject.mutate(req.id)}
                          disabled={isSubmitting}
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-lg font-medium text-gray-900">
                  No pending requests
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  New role requests will appear here
                </p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {req.name}
                      </h3>
                      <p className="text-sm text-gray-600">Request #{req.id}</p>
                    </div>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                        req.role
                      )}`}
                    >
                      {getRoleLabel(req.role)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">
                        Address
                      </p>
                      <p className="text-sm font-mono text-gray-900 break-all">
                        {req.user_address}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">
                        Location
                      </p>
                      <p className="text-sm text-gray-900">{req.location}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        approve.mutate({
                          id: req.id,
                          userAddress: req.user_address,
                        })
                      }
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() => reject.mutate(req.id)}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Header>
  );
};

export default Approve;
