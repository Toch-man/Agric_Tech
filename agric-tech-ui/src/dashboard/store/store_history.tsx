import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { config } from "../../wagmi";
import { wagmiContractConfig } from "../../contracts/contract";
import { readContract } from "wagmi/actions";

type Store_chain = {
  id: string;
  farmer: `0x${string}`;
  transporter: `0x${string}`;
  farmer_name: string;
  transporter_name: string;
  date: any;
  product_name: string;
  quantity: number;
};

const Store_history = () => {
  const [store_chain, set_store_chain] = useState<Store_chain[] | []>([]);
  const { address, isConnected } = useAccount();

  // Fixed: Using the correct function name from the contract
  const { data: store_history_count, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "get_history_count", // ✅ Correct function name
    args: [address, 2], // Role.Store_manager = 2
    query: { enabled: !!address },
  });

  useEffect(() => {
    async function get_store_history() {
      if (!isConnected || !address) return;

      const count = Number(store_history_count);

      if (count === 0) {
        set_store_chain([]);
        return;
      }

      const history = Array.from({ length: count }, (_, i) => {
        return readContract(config, {
          ...wagmiContractConfig,
          functionName: "get_store_history_byIndex",
          args: [address, BigInt(i)],
        });
      });

      const values = await Promise.all(history);
      const result = values.map((item: any) => ({
        id: item[0].toString(),
        farmer: item[1],
        transporter: item[2],
        farmer_name: item[3],
        transporter_name: item[4],
        date: item[5],
        product_name: item[6],
        quantity: Number(item[7]),
      }));

      set_store_chain(result);
    }

    get_store_history();
  }, [address, isConnected, store_history_count]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Store History
          </h1>
          <p className="text-gray-600">
            View all your supply chain transactions
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading history...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && store_chain.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No history yet
            </h3>
            <p className="mt-2 text-gray-500">
              Your supply chain transactions will appear here
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && store_chain.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Farmer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transporter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {store_chain.map((chain, id) => (
                    <tr key={id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{chain.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {chain.farmer_name}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {formatAddress(chain.farmer)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {chain.transporter_name}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {formatAddress(chain.transporter)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {chain.product_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {chain.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(Number(chain.date)).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Card */}
        {!isLoading && store_chain.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {store_chain.length}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Store_history;
