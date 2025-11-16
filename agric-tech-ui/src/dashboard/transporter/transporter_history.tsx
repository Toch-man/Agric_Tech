import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { readContract } from "wagmi/actions";
import { useAccount } from "wagmi";
import { wagmiContractConfig } from "../../contracts/contract";
import { config } from "../../wagmi";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

type transporter_chain = {
  id: string;
  farmer: `0x${string}`;
  store: `0x${string}`;
  farmer_name: string;
  store_name: string;
  crop_name: string;
  from: string;
  to: string;
  date: string;
};

const Transporter_history = () => {
  const [transporter_chain, set_transporter_chain] = useState<
    transporter_chain[] | []
  >([]);
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();

  const { data: transporter_history_count, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "get_transporter_history_count",
    args: [address, 1],
    query: { enabled: !!address },
  });

  useEffect(() => {
    async function get_transporter_history_byIndex() {
      if (!isConnected || !transporter_history_count) return;

      const count = Number(transporter_history_count);
      if (count === 0) {
        set_transporter_chain([]);
        return;
      }

      const history = Array.from({ length: count }, (_, i) => {
        return readContract(config, {
          ...wagmiContractConfig,
          functionName: "get_transporter_history_byIndex",
          args: [address, BigInt(i)],
        });
      });
      const values = await Promise.all(history);
      const result: transporter_chain[] = values.map((item: any) => ({
        id: item[0]?.toString() || "",
        farmer: item[1] || "",
        store: item[2] || "",
        farmer_name: item[3] || "",
        store_name: item[4] || "",
        crop_name: item[5] || "",
        from: item[6] || "",
        to: item[7] || "",
        date: item[8] ? new Date(Number(item[8])).toLocaleDateString() : "",
      }));
      set_transporter_chain(result);
    }
    get_transporter_history_byIndex();
  }, [address, isConnected, transporter_history_count]);

  return (
    <div className="p-4 md:p-8">
      <div className="relative flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div
          className="absolute top-2 left-2"
          onClick={() => navigate("transporter/dashboard")}
        >
          <FaArrowLeft size={18} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Delivery History</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track all your completed deliveries
          </p>
        </div>
        <div className="bg-blue-100 px-4 py-2 rounded-lg">
          <p className="text-sm text-gray-600">Total Deliveries</p>
          <p className="text-2xl font-bold text-blue-600">
            {transporter_chain.length}
          </p>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Crop Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Farmer
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Store
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                From
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                To
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Date
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  Loading history...
                </td>
              </tr>
            ) : transporter_chain.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No delivery history found.
                </td>
              </tr>
            ) : (
              transporter_chain.map((chain, id) => (
                <tr
                  key={id}
                  className={id % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    #{chain.id}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {chain.crop_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">
                        {chain.farmer_name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {chain.farmer.slice(0, 6)}...{chain.farmer.slice(-4)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">
                        {chain.store_name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {chain.store.slice(0, 6)}...{chain.store.slice(-4)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {chain.from}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {chain.to}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {chain.date}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading history...</p>
          </div>
        ) : transporter_chain.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
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
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Delivery History
            </h3>
            <p className="text-gray-600">
              Your completed deliveries will appear here.
            </p>
          </div>
        ) : (
          transporter_chain.map((chain, id) => (
            <div
              key={id}
              className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {chain.crop_name}
                  </h3>
                  <p className="text-sm text-gray-500">Delivery #{chain.id}</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-20">
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      Farmer
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {chain.farmer_name}
                    </p>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      {chain.farmer.slice(0, 10)}...{chain.farmer.slice(-8)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-20">
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      Store
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {chain.store_name}
                    </p>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      {chain.store.slice(0, 10)}...{chain.store.slice(-8)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="font-medium">From:</span>
                    <span className="ml-2">{chain.from}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="font-medium">To:</span>
                    <span className="ml-2">{chain.to}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex items-center text-sm text-gray-600">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-medium">Delivered on:</span>
                    <span className="ml-2">{chain.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Summary */}
      {transporter_chain.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Deliveries
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {transporter_chain.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Unique Farmers
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(transporter_chain.map((c) => c.farmer)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Unique Stores
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(transporter_chain.map((c) => c.store)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transporter_history;
