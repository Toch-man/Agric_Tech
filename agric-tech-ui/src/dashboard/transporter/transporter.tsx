import { useEffect, useState } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { readContract } from "wagmi/actions";
import { config } from "../../wagmi";
import { useMutation } from "@tanstack/react-query";
import { wagmiContractConfig } from "../../contracts/contract";
import { getUserName } from "../../get_user_name";

export type delivery = {
  id: number;
  crop_id: string;
  name: string;
  farmer: string;
  transporter: string;
  store: string;
  pick_up_location: string;
  destination: string;
  quantity: number;
  Status: string;
};

const Transporter_dashboard = () => {
  const { address, isConnected } = useAccount();
  const [is_submitting, set_isSubmitting] = useState(false);
  const [txHash, set_txHash] = useState<`0x${string}` | undefined>(undefined);
  const [deliveries, set_deliveries] = useState<delivery[] | []>([]);

  const { writeContractAsync } = useWriteContract();

  const {
    data: aval_delivery_count,
    isLoading,
    refetch,
  } = useReadContract({
    ...wagmiContractConfig,
    functionName: "get_delivery_count",

    query: { enabled: !!address },
  });

  const {
    isSuccess: isConfirmed,
    isError: isConfirmationError,
    error: confirmationError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
    query: { enabled: !!txHash, retry: 3, retryDelay: 1000 },
  });

  useEffect(() => {
    async function get_deliveries() {
      if (isConnected) {
        const count = Number(aval_delivery_count);
        const deliveries = Array.from({ length: count }, (_, i) =>
          readContract(config, {
            ...wagmiContractConfig,
            functionName: "get_delivery_byIndex",
            args: [BigInt(i + 1)],
          })
        );
        const values = await Promise.all(deliveries);

        const result = await Promise.all(
          values
            .filter(
              (item: any) => item[4]?.toLowerCase() === address?.toLowerCase()
            )
            .map(async (item: any): Promise<delivery> => {
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
                Status: item[9],
              };
            })
        );

        set_deliveries(result);
      }
    }
    get_deliveries();
  }, [aval_delivery_count, isConnected, address, isConfirmed]);

  const deliver = useMutation({
    mutationFn: async (data: { id: number }) => {
      if (!isConnected) return;
      try {
        set_isSubmitting(true);
        const deliver_hash = await writeContractAsync({
          ...wagmiContractConfig,
          functionName: "product_inTransit",
          args: [BigInt(data.id)],
        });
        set_txHash(deliver_hash);
        set_isSubmitting(false);
      } catch (error) {
        console.error(error);
        set_isSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (isConfirmed) {
      const timer = setTimeout(() => {
        refetch();
        set_txHash(undefined);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, txHash]);

  const get_button_message = () =>
    deliver.isPending || is_submitting ? "Preparing..." : "Deliver";

  const get_status_message = () => {
    if (isConfirmed) return "Transaction successful";
    if (isConfirmationError) return "Transaction failed. Try again.";
    if (deliver.isPending && !txHash) return "Preparing transaction...";
    if (txHash && !isConfirmationError && confirmationError)
      return "Confirming transaction...";
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Transporter Dashboard
        </h1>
      </div>

      <p className="text-sm text-gray-600 mb-4">{get_status_message()}</p>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Product ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Product Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Farmer
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Store
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Pick-up Location
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Destination
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Loading deliveries...
                </td>
              </tr>
            ) : deliveries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No deliveries assigned.
                </td>
              </tr>
            ) : (
              deliveries.map((delivery, id) => (
                <tr
                  key={id}
                  className={id % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-3 text-sm">{delivery.crop_id}</td>
                  <td className="px-4 py-3 text-sm">{delivery.name}</td>
                  <td className="px-4 py-3 text-sm">{delivery.farmer}</td>
                  <td className="px-4 py-3 text-sm">{delivery.store}</td>
                  <td className="px-4 py-3 text-sm">
                    {delivery.pick_up_location}
                  </td>
                  <td className="px-4 py-3 text-sm">{delivery.destination}</td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => deliver.mutate({ id: delivery.id })}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                      disabled={is_submitting}
                    >
                      {get_button_message()}
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

export default Transporter_dashboard;
