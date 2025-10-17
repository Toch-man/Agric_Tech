import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { readContract } from "wagmi/actions";
import { useMutation } from "@tanstack/react-query";
import { config } from "../../wagmi";
import { wagmiContractConfig } from "../../contracts/contract";

type User = {
  user_address: `0x${string}`;
  name: string;
  location: string;
  successful_delivery: number;
  role: number;
};

const List_user = () => {
  const { address, isConnected } = useAccount();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { writeContractAsync } = useWriteContract();

  //  Read total users count
  const { data: all_user_count, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "get_all_users_count",
    query: { enabled: !!address },
  });

  // Track transaction confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isTxError,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
    query: { enabled: !!txHash },
  });

  // Mutation to remove a user
  const resign = useMutation({
    mutationFn: async (userAddr: `0x${string}`) => {
      if (!isConnected) return;
      setIsSubmitting(true);
      const hash = await writeContractAsync({
        ...wagmiContractConfig,
        functionName: "resign_user",
        args: [userAddr],
      });
      setTxHash(hash);
      setIsSubmitting(false);
    },
  });

  //  Fetch all users from contract
  useEffect(() => {
    async function fetchAllUsers() {
      console.log("fetching users");
      if (!isConnected || all_user_count == 0 || isLoading) return;
      const count = Number(all_user_count);
      if (count === 0) {
        setUsers([]);
        return;
      }
      console.log("fetching users");
      const calls = Array.from({ length: count }, (_, i) =>
        readContract(config, {
          ...wagmiContractConfig,
          functionName: "get_user_byIndex",
          args: [BigInt(i)],
        })
      );

      const results = await Promise.all(calls);
      const formatted: User[] = results.map((item: any) => ({
        user_address: item[0],
        name: item[1],
        location: item[2],
        successful_delivery: Number(item[3]),
        role: Number(item[4]),
      }));

      setUsers(formatted);
    }
    fetchAllUsers();
  }, [isConnected, all_user_count, txHash]);

  //  Filter users if search input has text
  const visibleUsers =
    search.trim().length === 0
      ? users
      : users.filter(
          (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.user_address.toLowerCase().includes(search.toLowerCase())
        );

  const getRoleName = (role: number) => {
    if (role === 0) return "Farmer";
    if (role === 1) return "Transporter";
    if (role === 2) return "Store Manager";
    return "Unknown";
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">
        Registered Users
      </h1>

      {/* Search Box */}
      <div className="flex justify-center mb-6 relative">
        <input
          type="text"
          placeholder="Search by name or address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-full py-2 px-4 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {/* <span className="absolute right-4 top-2.5 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="md:h-5 md:w-5 w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span> */}
      </div>

      {/* Transaction status */}
      {txHash && (
        <p className="text-center text-blue-600 mb-4 break-words">
          Tx Hash: {txHash}
        </p>
      )}
      {isConfirming && (
        <p className="text-center text-gray-600 mb-4">⏳ Confirming...</p>
      )}
      {isConfirmed && (
        <p className="text-center text-green-600 mb-4">
          Transaction confirmed!
        </p>
      )}
      {isTxError && (
        <p className="text-center text-red-600 mb-4">
          Transaction failed: {txError?.message}
        </p>
      )}

      {/* Users Table */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-md rounded-lg">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="p-3 text-left">Address</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Deliveries</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((u, idx) => (
                <tr
                  key={u.user_address}
                  className={`${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="p-3 truncate max-w-[150px]">
                    {u.user_address}
                  </td>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.location}</td>
                  <td className="p-3">{getRoleName(u.role)}</td>
                  <td className="p-3">{u.successful_delivery}</td>
                  <td className="p-3">
                    <button
                      onClick={() => resign.mutate(u.user_address)}
                      disabled={isSubmitting || isConfirming}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      {isSubmitting ? "Processing..." : "Resign"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default List_user;
