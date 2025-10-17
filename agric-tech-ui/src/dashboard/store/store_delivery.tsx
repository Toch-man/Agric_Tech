import { useEffect, useState } from "react";
import { config } from "../../wagmi";
import { wagmiContractConfig } from "../../contracts/contract";
import { readContract } from "wagmi/actions";
import { useWriteContract } from "wagmi";
import { useReadContract } from "wagmi";
import { useWaitForTransactionReceipt } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { delivery } from "./../transporter/transporter";
import { Link } from "react-router-dom";

const Store_deliveries = () => {
  const [deliveries, set_deliveries] = useState<delivery[] | []>([]);
  const { address, isConnected } = useAccount();
  const [txHash, set_txHash] = useState<`0x${string}` | undefined>(undefined);
  const [is_submitting, set_isSubmitting] = useState(false);
  const [arrival_date, set_arrival_date] = useState<string | undefined>(
    undefined
  );
  const { writeContractAsync } = useWriteContract();

  const { data: delivery_count, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "get_delivery_count",
    query: { enabled: !!address },
  });

  useEffect(() => {
    async function get_deliveries() {
      if (isConnected) {
        const count = Number(delivery_count);
        const products = Array.from({ length: count }, (_, i) => {
          return readContract(config, {
            ...wagmiContractConfig,
            functionName: "get_delivery_byIndex",
            args: [BigInt(i)],
          });
        });
        const values = await Promise.all(products);
        const result: delivery[] = values
          .filter((item: any) => item[4] === address) // keep only deliveries for this store
          .map((item: any) => ({
            crop_id: item[0],
            name: item[1],
            farmer: item[2],
            transporter: item[3],
            store: item[4],
            pick_up_location: item[5],
            destination: item[6],
            quantity: item[7],
            Status: item[8],
          }));
        set_deliveries(result);
      }
    }
    get_deliveries();
  }, [address, isConnected, delivery_count]);

  const {
    isSuccess: isConfirmed,
    isError: isConfirmationError,
    error: confirmationError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
    query: { enabled: !!txHash, retry: 3, retryDelay: 1000 },
  });

  const confirm = useMutation({
    mutationFn: async (data: { id: string; arrival_date: string }) => {
      try {
        if (!isConnected) return;
        set_isSubmitting(true);
        const txHash = await writeContractAsync({
          ...wagmiContractConfig,
          functionName: "confirmArrival",
          args: [BigInt(data.id), data.arrival_date],
        });
        set_txHash(txHash);
        set_isSubmitting(false);
      } catch (error) {
        set_isSubmitting(false);
      }
    },
  });

  const get_button_message = () => {
    if (confirm.isPending || is_submitting) return "Preparing";
    return "Confirm Delivery";
  };

  const get_status_message = () => {
    if (isConfirmed) return "Transaction successful";
    if (isConfirmationError) return "Transaction failed try again";
    if (confirm.isPending && !txHash) return "preparing transaction";
    if (txHash && !isConfirmationError && confirmationError)
      return "confirming transactioon";
  };

  return (
    <div>
      <h1>Assigned deliveries</h1>
      <p>{get_status_message()}</p>
      <Link to="/product_in_store">View product in store</Link>
      <section>
        <table>
          <thead>
            <tr className=" bg-white w-full py-3 text-black text-[20px] font-bold">
              <td className="w-fit-content h-[5px] bg-gray-400 p-5">ID</td>
              <td className="w-fit-content h-[5px] bg-gray-400 p-5">
                Product Name
              </td>
              <td className="w-fit-content h-[5px] bg-gray-400 p-5">
                farmer_address
              </td>
              <td className="w-fit-content h-[5px] bg-gray-400 p-5">
                Pick up location
              </td>
              <td className="w-fit-content h-[5px] bg-gray-400 p-5">
                Destination
              </td>
              <td className="w-fit-content h-[5px] bg-gray-400 p-5">Action</td>
            </tr>
          </thead>
          {isLoading ? (
            <tr>
              <td>Loading Date</td>
            </tr>
          ) : (
            <tbody>
              {deliveries.map((delivery, id) => (
                <tr>
                  <td key={id}>{delivery.crop_id}</td>
                  <td key={id}>{delivery.name}</td>
                  <td key={id}>{delivery.farmer}</td>
                  <td key={id}>{delivery.pick_up_location}</td>
                  <td key={id}>{delivery.destination}</td>
                  <td key={id}>
                    <input
                      type="date"
                      value={arrival_date}
                      onChange={(e) => set_arrival_date(e.target.value)}
                    ></input>
                  </td>
                  <td key={id}>
                    <button
                      className={`cursor-pointer ${arrival_date == undefined && "cursor-not-allowed opacity-50"}`}
                      onClick={() =>
                        confirm.mutate({
                          id: delivery.crop_id,
                          arrival_date: arrival_date!,
                        })
                      }
                    >
                      {get_button_message()}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </section>
    </div>
  );
};
export default Store_deliveries;
