import { useEffect, useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { useAccount } from "wagmi";
import { useWaitForTransactionReceipt } from "wagmi";
import { readContract } from "wagmi/actions";
import { config } from "../../wagmi";
import { useMutation } from "@tanstack/react-query";
import { wagmiContractConfig } from "../../contracts/contract";

export type delivery = {
  crop_id: string;
  name: string;
  farmer: `0x${string}`;
  transporter: `0x${string}`;
  store: `0x${string}`;
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

  const { data: aval_delivery_count, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "delivery_count",
    query: { enabled: !!address },
  });
  useEffect(() => {
    async function get_deliveries() {
      if (isConnected) {
        const count = Number(aval_delivery_count);
        const deliveries = Array.from({ length: count }, (_, i) => {
          return readContract(config, {
            ...wagmiContractConfig,
            functionName: "get_delivery_byIndex",
            args: [BigInt(i)],
          });
        });
        const values = await Promise.all(deliveries);
        const result: delivery[] = values
          .filter((item: any) => item[3] === address) // keep only deliveries for this transporter
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
  }, [aval_delivery_count, isConnected, address]); //fetch deliveries

  const {
    isSuccess: isConfirmed,
    isError: isConfirmationError,
    error: confirmationError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
    query: { enabled: !!txHash, retry: 3, retryDelay: 1000 },
  });

  const deliver = useMutation({
    mutationFn: async (data: { id: string }) => {
      try {
        if (!isConnected) return;
        set_isSubmitting(true);
        const deliver_hash = await writeContractAsync({
          ...wagmiContractConfig,
          functionName: "product_inTransit",
          args: [BigInt(data.id)],
        });
        set_txHash(deliver_hash);
        set_isSubmitting(false);
      } catch (error) {
        set_isSubmitting(false);
      }
    },
  });

  const get_button_message = () => {
    if (deliver.isPending || is_submitting) return "Preparing";
    return "Deliver";
  };

  const get_status_message = () => {
    if (isConfirmed) return "Transaction successful";
    if (isConfirmationError) return "Transaction failed try again";
    if (deliver.isPending && !txHash) return "preparing transaction";
    if (txHash && !isConfirmationError && confirmationError)
      return "confirming transactioon";
  };
  return (
    <div>
      <h1>Assigned deliveries</h1>
      <p>{get_status_message()}</p>
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
                    <button
                      onClick={() => deliver.mutate({ id: delivery.crop_id })}
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

export default Transporter_dashboard;
