import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { readContract } from "wagmi/actions";
import { useAccount } from "wagmi";
import { wagmiContractConfig } from "../../contracts/contract";
import { config } from "../../wagmi";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

type farmer_chain = {
  id: string;
  farmer: `0x${string}`;
  product_name: string;
  sent_to: string;
  store: `0x${string}`;
  store_location: string; // ✅ Added store location
  through: string;
  transporter: `0x${string}`;
  date: any;
};

const Farmer_history = () => {
  const [farmer_history, set_farmer_history] = useState<farmer_chain[] | []>(
    []
  );
  const { address, isConnected } = useAccount();

  const { data: farmer_history_count, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "get_history_count",
    args: [address, 0],
    query: { enabled: !!address },
  });

  const navigate = useNavigate();

  useEffect(() => {
    async function get_farmer_history_byIndex() {
      if (!address || !isConnected) return;

      const count = Number(farmer_history_count);

      if (count === 0) {
        set_farmer_history([]);
        return;
      }

      const history = Array.from({ length: count }, (_, i) => {
        return readContract(config, {
          ...wagmiContractConfig,
          functionName: "get_farmer_history_byIndex",
          args: [address, BigInt(i)],
        });
      });

      try {
        const values = await Promise.all(history);

        // ✅ Fetch store locations for each history item
        const result: farmer_chain[] = await Promise.all(
          values.map(async (item: any) => {
            let storeLocation = "Unknown";

            // Fetch store location using the store address
            try {
              const storeData: any = await readContract(config, {
                ...wagmiContractConfig,
                functionName: "get_user_byAddress",
                args: [item[4]], // item[4] is the store address
              });
              storeLocation = storeData[2] || "Unknown"; // [2] is the location field
            } catch (error) {
              console.error("Error fetching store location:", error);
            }

            return {
              id: item[0]?.toString() || "",
              farmer: item[1] || "",
              product_name: item[2] || "",
              sent_to: item[3] || "",
              store: item[4] || "",
              store_location: storeLocation,
              through: item[5] || "",
              transporter: item[6] || "",
              date: item[7]
                ? new Date(Number(item[7])).toLocaleDateString()
                : "",
            };
          })
        );

        set_farmer_history(result);
      } catch (error) {
        console.error("Error fetching farmer history:", error);
        set_farmer_history([]);
      }
    }

    get_farmer_history_byIndex();
  }, [address, isConnected, farmer_history_count]);

  return (
    <div className="relative p-4 md:p-8">
      <div
        className="absolute top-2 left-2 cursor-pointer hover:text-blue-600 transition-colors"
        onClick={() => navigate("/farmer/dashboard")}
      >
        <FaArrowLeft size={18} />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        Supply History
      </h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-500">Loading history...</p>
        </div>
      ) : farmer_history.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No supply history found
          </h3>
          <p className="mt-2 text-gray-500">
            Your delivery history will appear here once you send products to
            stores.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Product Name</th>
                <th className="p-3 text-left">Store Location</th>
                <th className="p-3 text-left">Store Name</th>
                <th className="p-3 text-left">Transporter Name</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {farmer_history.map((chain, idx) => (
                <tr
                  key={idx}
                  className={`${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100 transition-colors`}
                >
                  <td className="p-3">{chain.id}</td>
                  <td className="p-3">{chain.product_name}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      📍 {chain.store_location}
                    </span>
                  </td>
                  <td className="p-3">{chain.sent_to}</td>
                  <td className="p-3">{chain.through}</td>
                  <td className="p-3">{chain.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Farmer_history;
