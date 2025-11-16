import { useEffect, useState } from "react";
import { config } from "../../wagmi";
import { wagmiContractConfig } from "../../contracts/contract";
import { readContract } from "wagmi/actions";
import { useWriteContract } from "wagmi";
import { useReadContract } from "wagmi";
import { useWaitForTransactionReceipt } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { delivery } from "./../transporter/transporter";
import { Link } from "react-router-dom";
import { getUserName } from "../../get_user_name";

type ConfirmationDialog = {
  isOpen: boolean;
  delivery: delivery | null;
};

const Store_deliveries = () => {
  const [deliveries, set_deliveries] = useState<delivery[] | []>([]);
  const { address, isConnected } = useAccount();
  const [txHash, set_txHash] = useState<`0x${string}` | undefined>(undefined);
  const [is_submitting, set_isSubmitting] = useState(false);
  const [arrival_dates, set_arrival_dates] = useState<{
    [key: string]: string;
  }>({});
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({
    isOpen: false,
    delivery: null,
  });
  const { writeContractAsync } = useWriteContract();

  const {
    data: delivery_count,
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

  // Update the page after successful confirmation
  useEffect(() => {
    if (isConfirmed) {
      const timer = setTimeout(() => {
        refetch(); // Refetch delivery count
        set_txHash(undefined); // Reset transaction hash
        set_isSubmitting(false);
        alert("Delivery confirmed successfully!");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, refetch]);

  useEffect(() => {
    if (isConfirmed && confirmDialog.delivery) {
      setConfirmDialog((prev) => ({ ...prev, isOpen: true }));
    }
  }, [isConfirmed]);

  useEffect(() => {
    async function get_deliveries() {
      if (isConnected) {
        const count = Number(delivery_count);
        const products = Array.from({ length: count }, (_, i) => {
          return readContract(config, {
            ...wagmiContractConfig,
            functionName: "get_delivery_byIndex",
            args: [BigInt(i + 1)],
          });
        });
        const values = await Promise.all(products);

        const result = await Promise.all(
          values
            .filter(
              (item: any) => item[5]?.toLowerCase() === address?.toLowerCase()
            )
            .map(async (item: any): Promise<delivery> => {
              const farmerName = await getUserName(item[3]);
              const transporterName = await getUserName(item[4]);

              return {
                id: item[0],
                crop_id: item[1],
                name: item[2],
                farmer: farmerName,
                transporter: transporterName,
                store: item[5],
                pick_up_location: item[6],
                destination: item[7],
                quantity: Number(item[8]),
                Status: String(item[9]),
              };
            })
        );

        set_deliveries(result.filter((delivery) => delivery.Status !== "2"));
      }
    }
    get_deliveries();
  }, [address, isConnected, delivery_count, isConfirmed]);

  const confirm = useMutation({
    mutationFn: async (data: { id: number; arrival_date: string }) => {
      try {
        if (!isConnected) return;
        set_isSubmitting(true);
        const txHash = await writeContractAsync({
          ...wagmiContractConfig,
          functionName: "confirmArrival",
          args: [
            BigInt(data.id),
            BigInt(new Date(data.arrival_date).getTime()),
          ],
        });
        set_txHash(txHash);
        set_isSubmitting(false);
      } catch (error) {
        console.error(error);
        set_isSubmitting(false);
      }
    },
  });

  const get_button_message = () => {
    if (confirm.isPending || is_submitting) return "Preparing...";
    return "Confirm Delivery";
  };

  const get_status_message = () => {
    if (isConfirmed) return "Transaction successful - Updating...";
    if (isConfirmationError) return "Transaction failed. Try again.";
    if (confirm.isPending && !txHash) return "Preparing transaction...";
    if (txHash && !isConfirmationError && confirmationError)
      return "Confirming transaction...";
  };

  const handleDateChange = (deliveryId: number, date: string) => {
    set_arrival_dates((prev) => ({
      ...prev,
      [deliveryId]: date,
    }));
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Assigned Deliveries
        </h1>
        <Link
          to="/store/product_in_store"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          View Products in Store
        </Link>
      </div>

      {get_status_message() && (
        <p className="text-sm text-gray-600 mb-4">{get_status_message()}</p>
      )}

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
                Transporter
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Pick-up Location
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Destination
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Arrival Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="text-center py-6 text-gray-500">
                  Loading deliveries...
                </td>
              </tr>
            ) : deliveries.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-6 text-gray-500">
                  No deliveries assigned.
                </td>
              </tr>
            ) : (
              deliveries.map((delivery, id) => (
                <tr
                  key={delivery.id}
                  className={id % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-3 text-sm">{delivery.crop_id}</td>
                  <td className="px-4 py-3 text-sm">{delivery.name}</td>
                  <td className="px-4 py-3 text-sm">{delivery.farmer}</td>
                  <td className="px-4 py-3 text-sm">{delivery.transporter}</td>
                  <td className="px-4 py-3 text-sm">
                    {delivery.pick_up_location}
                  </td>
                  <td className="px-4 py-3 text-sm">{delivery.destination}</td>
                  <td className="px-4 py-3 text-sm">{delivery.quantity}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        delivery.Status === "0"
                          ? "bg-yellow-100 text-yellow-800"
                          : delivery.Status === "1"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {delivery.Status === "0"
                        ? "Pick Up"
                        : delivery.Status === "1"
                        ? "In Transit"
                        : "Delivered"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <input
                      type="date"
                      value={arrival_dates[delivery.id] || ""}
                      onChange={(e) =>
                        handleDateChange(delivery.id, e.target.value)
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={delivery.Status === "2"}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() =>
                        confirm.mutate({
                          id: delivery.id,
                          arrival_date: arrival_dates[delivery.id],
                        })
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        is_submitting ||
                        !arrival_dates[delivery.id] ||
                        delivery.Status === "2"
                      }
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

export default Store_deliveries;
