import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useSendTransaction } from "wagmi";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
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

  const { data: pending_request_count, refetch: refetchPendingCount } =
    useReadContract({
      ...wagmiContractConfig,
      functionName: "get_pending_request_count",
      query: { enabled: !!address },
    });

  useEffect(() => {
    async function fetchRequests() {
      if (!isConnected) return;
      const count = Number(pending_request_count || 0);
      if (count === 0) return;

      const calls = Array.from({ length: count }, (_, i) =>
        readContract(config, {
          ...wagmiContractConfig,
          functionName: "get_pending_request_byIndex",
          args: [BigInt(i + 1)],
        })
      );

      const all = await Promise.all(calls);
      const values: Request[] = all.map((item: any, idx: number) => ({
        id: idx + 1,
        user_address: item[0],
        name: item[1],
        location: item[2],
        role: Number(item[3]),
        isApproved: Boolean(item[4]),
      }));

      setRequests(values);
    }

    fetchRequests();
  }, [isConnected, pending_request_count]);

  //  Transaction receipts
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

  const approve = useMutation({
    mutationFn: async (id: number) => {
      if (!isConnected) return;
      setIsSubmitting(true);
      try {
        const hash = await writeContractAsync({
          ...wagmiContractConfig,
          functionName: "approve_role",
          args: [BigInt(id)],
        });

        setTxHash(hash);
      } finally {
        setIsSubmitting(false);
      }
      refetchPendingCount();
    },
  });

  const fund_account = async (addr: `0x${string}`) => {
    try {
      await sendTransaction({
        to: addr,
        value: parseEther("0.10"), //send 0.1 celo
      });
    } catch (err) {
      console.error(err);
    }
  };
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
      refetchPendingCount();
    },
  });

  function getApproveStatus() {
    if (approvePending || isPending) {
      if (approvePending) return "Confirming approve tx...";
      else if (isPending) return "Funding address...";
    }
    if (approveConfirmed || isSuccess) {
      if (approveConfirmed) return "Approve confirmed ";
      else if (isSuccess) return "Succesfully funded account...";
    }
    if (approveError) return "Approve failed ";
    return "";
  }

  function getRejectStatus() {
    if (rejectPending) return "Confirming reject tx...";
    if (rejectConfirmed) return "Reject confirmed ";
    if (rejectError) return "Reject failed ";
    return "";
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">
        Pending Role Requests
      </h1>

      <div className="mb-4 space-y-2 text-center text-sm">
        {txHash && (
          <p className="text-green-600 break-words">
            Approve Tx Hash: {txHash} {getApproveStatus()}
            Funding TX Hash: {data?.slice(0, 10)}...
          </p>
        )}
        {rejectTxHash && (
          <p className="text-red-600 break-words">
            Reject Tx Hash: {rejectTxHash} {getRejectStatus()}
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded-lg">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">User Address</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No pending requests.
                </td>
              </tr>
            ) : (
              requests.map((req, idx) => (
                <tr
                  key={req.id}
                  className={`${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="p-3">{req.id}</td>
                  <td className="p-3 truncate max-w-[140px]">
                    {req.user_address}
                  </td>
                  <td className="p-3">{req.name}</td>
                  <td className="p-3">{req.location}</td>
                  <td className="p-3">
                    {req.role === 0
                      ? "Farmer"
                      : req.role === 1
                      ? "Transporter"
                      : req.role === 2
                      ? "Store Manager"
                      : "None"}
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => {
                        approve.mutate(req.id);
                        fund_account(req.user_address);
                      }}
                      disabled={isSubmitting}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject.mutate(req.id)}
                      disabled={isSubmitting}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Approve;
// import { parseEther } from "viem";
// import { useSendTransaction } from "wagmi";

// function ApproveButton({ userAddress }) {
//   const { sendTransaction, data, isPending, isSuccess } = useSendTransaction();

//   const handleApprove = async () => {
//     try {
//       await sendTransaction({
//         to: userAddress,
//         value: parseEther("1"), // send 1 CELO
//       });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <button onClick={handleApprove} disabled={isPending}>
//       {isPending ? "Sending…" : "Approve & Fund"}
//     </button>
//   );
// }
