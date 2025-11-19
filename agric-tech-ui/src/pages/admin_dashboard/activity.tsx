import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { readContract } from "wagmi/actions";
import { wagmiContractConfig } from "../../contracts/contract";
import { config } from "../../wagmi";
import { getUserName } from "../../get_user_name";

type delivery = {
  id: number;
  crop_id: string;
  name: string;
  farmer: string;
  transporter: string;
  store: string;
  pick_up_location: string;
  destination: string;
  quantity: number;
  status: string;
};

const Activity = () => {
  const [deliveries, set_deliveries] = useState<delivery[] | []>([]);
  const { address, isConnected } = useAccount();
  const { data: delivery_count, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "get_delivery_count",
    query: { enabled: !!address },
  });

  useEffect(() => {
    async function get_delivery_byIndex() {
      if (!isConnected || !delivery_count) return;
      const count = Number(delivery_count);

      if (count === 0) {
        set_deliveries([]);
        return;
      }

      const deliveries = Array.from({ length: count }, (_, i) => {
        return readContract(config, {
          ...wagmiContractConfig,
          functionName: "get_delivery_byIndex",
          args: [BigInt(i + 1)],
        });
      });
      const values = await Promise.all(deliveries);
      const result = await Promise.all(
        values.map(async (item: any): Promise<delivery> => {
          const farmerName = await getUserName(item[3]);
          const storeName = await getUserName(item[5]);
          const transporterName = await getUserName(item[4]);
          return {
            id: item[0],
            crop_id: item[1],
            name: item[2],
            farmer: farmerName,
            transporter: transporterName,
            store: storeName,
            pick_up_location: item[6],
            destination: item[7],
            quantity: Number(item[8]),
            status: item[9],
          };
        })
      );
      set_deliveries(result);
    }

    get_delivery_byIndex();
  }, [address, delivery_count, isConnected]);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Farm to Store Chain
        </h1>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search"
            className="w-full border border-gray-300 rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
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
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading deliveries...</span>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Product Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Farmer Address
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Pick Up Location
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Transporter
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Destination
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Store
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deliveries.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500 text-sm"
                  >
                    No deliveries found.
                  </td>
                </tr>
              ) : (
                deliveries.map((delivery, id) => (
                  <tr
                    key={id}
                    className={id % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {delivery.crop_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {delivery.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 break-all">
                      {delivery.farmer}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {delivery.pick_up_location}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {delivery.transporter}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {delivery.destination}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 break-all">
                      {delivery.store}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Activity;
