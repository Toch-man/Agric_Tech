import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { readContract } from "wagmi/actions";
import { useAccount } from "wagmi";
import { wagmiContractConfig } from "../../contracts/contract";
import { config } from "../../wagmi";

type farmer_chain = {
  id: string;
  farmer: `0x${string}`;
  product_name: string;
  sent_to: string;
  store: `0x${string}`;
  through: string;
  transporter: `0x${string}`;
  date: any;
};
// reject delivery
// cancle shipment
const Farmer_history = () => {
  const [farmer_history, set_farmer_history] = useState<farmer_chain[] | []>(
    []
  );
  const { address, isConnected } = useAccount();

  const { data: farmer_history_count, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "farmer_history_count",
    args: [address],
    query: { enabled: !!address },
  });

  useEffect(() => {
    async function get_farmer_history_byIndex() {
      const count = Number(farmer_history_count);
      const history = Array.from({ length: count }, () => {
        return readContract(config, {
          ...wagmiContractConfig,
          functionName: "get_farmer_history_byIndex",
          args: [address],
        });
      });

      const values = await Promise.all(history);
      const result: farmer_chain[] = await Promise.all(
        values.map((item: any) => ({
          id: item[0],
          farmer: item[1],
          product_name: item[2],
          sent_to: item[3],
          store: item[4],
          through: item[5],
          transporter: item[6],
          date: item[7],
        }))
      );
      set_farmer_history(result);
    }
    get_farmer_history_byIndex();
  }, [address, isConnected, farmer_history_count]);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        Supply History
      </h1>

      {isLoading ? (
        <p className="text-center text-gray-500">Loading history...</p>
      ) : farmer_history.length === 0 ? (
        <p className="text-center text-gray-500">No supply history found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Product Name</th>
                <th className="p-3 text-left">Owner Address</th>
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
                  } hover:bg-gray-100`}
                >
                  <td className="p-3">{chain.id}</td>
                  <td className="p-3">{chain.product_name}</td>
                  <td className="p-3 truncate max-w-[160px]">{chain.farmer}</td>
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
