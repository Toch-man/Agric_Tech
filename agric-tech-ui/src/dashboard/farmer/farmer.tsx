import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useReadContract } from "wagmi";
import { config } from "../../wagmi";
import { readContract } from "wagmi/actions";
import { useWriteContract } from "wagmi";
import { useWaitForTransactionReceipt } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { wagmiContractConfig } from "../../contracts/contract";

type Crop = {
  id: string;
  name: string;
  quantity: string;
  harvestDate: string;
  farmer: `0x${string}`;
  delivered: boolean;
};
type deliverDetails = {
  crop_id: number;
  quantity: number;
  store: `0x${string}`;
  transporter: `0x${string}`;
  pick_up_location: string;
  destination: string;
};
type uploadDetails = {
  name: string;
  quantity: number;
  harvestDate: string;
};

const Farmer_dashboard = () => {
  const { address, isConnected } = useAccount();
  const [isSubmitting, set_isSubmitting] = useState(false);
  const [available_products, set_available_products] = useState<Crop[] | []>(
    []
  );
  const [current_cropId, set_current_cropId] = useState<number | undefined>(
    undefined
  );
  const [upload_txHash, set_upload_txHash] = useState<
    `0x${string}` | undefined
  >(undefined);
  const [txHash, set_txHash] = useState<`0x${string}` | undefined>(undefined);
  const [display_delivery_form, set_display_delivery_form] = useState(false);
  const [display_upload_form, set_display_upload_form] = useState(false);
  const [delivery_details, set_delivery_details] = useState<
    deliverDetails[] | []
  >([]);
  const [upload_details, set_upload_details] = useState<uploadDetails[] | []>(
    []
  );

  const { writeContractAsync } = useWriteContract();

  const { data: aval_products_count, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "get_product_count",
    query: { enabled: !!address },
  });

  useEffect(() => {
    async function get_products() {
      if (isConnected) {
        const count = Number(aval_products_count);
        const products = Array.from({ length: count }, (_, i) => {
          return readContract(config, {
            ...wagmiContractConfig,
            functionName: "get_product_by_index",
            args: [BigInt(i)],
          });
        });

        const values = await Promise.all(products);
        const result: Crop[] = await Promise.all(
          values.map((item: any) => ({
            id: item[0],
            name: item[1],
            quantity: item[2],
            harvestDate: item[3],
            farmer: item[4],
            delivered: item[5],
          }))
        );
        set_available_products(result);
      }
    }
    get_products();
  }, [address, isConnected, aval_products_count]);

  const {
    isSuccess: isConfirmed,
    isError: isConfirmationError,
    error: confirmationError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
    query: { enabled: !!txHash, retry: 3, retryDelay: 1000 },
  });

  const upload = useMutation({
    mutationFn: async (data: {
      name: string;
      quantity: number;
      harvestDate: any;
    }) => {
      try {
        if (!isConnected) return;
        set_isSubmitting(true);
        const upload_hash = await writeContractAsync({
          ...wagmiContractConfig,
          functionName: "",
          args: [data.name, data.quantity, data.harvestDate],
        });

        set_upload_txHash(upload_hash);
        set_isSubmitting(false);
      } catch (error) {
        set_isSubmitting(false);
      }
    },
  });

  const deliver = useMutation({
    mutationFn: async (data: {
      crop_id: number;
      quantity: number;
      store: `0x${string}`;
      transporter: `0x${string}`;
      pick_up_location: string;
      destination: string;
    }) => {
      try {
        if (!isConnected) return;
        set_isSubmitting(true);
        const hash = await writeContractAsync({
          ...wagmiContractConfig,
          functionName: "send_to_transporter",
          args: [
            data.crop_id,
            data.quantity,
            data.store,
            data.transporter,
            data.pick_up_location,
            data.destination,
          ],
        });
        set_txHash(hash);
        set_isSubmitting(false);
      } catch (error) {
        set_isSubmitting(false);
      }
    },
  });

  function get_status_message() {
    if (isConfirmed) return "Transaction successful";
    if (isConfirmationError) return "Transaction failed try again";
    if (deliver.isPending && !txHash) return "preparing transaction";
    if (txHash && !isConfirmationError && confirmationError)
      return "confirming transactioon";
  }
  function get_button_message() {
    if (deliver.isPending || isSubmitting) return "Preparing";
    return "Deliver";
  }
  const delivery_form = (
    <form>
      <label htmlFor="pick_up">Pick_up_location</label>
      <input
        type="text"
        id="pick_up"
        onChange={(e) =>
          set_delivery_details([
            { ...delivery_details[0], pick_up_location: e.target.value },
          ])
        }
        value={delivery_details[0].pick_up_location}
      ></input>
      <br />
      <label htmlFor="destination">Destination</label>
      <input
        type="text"
        id="destination"
        onChange={(e) =>
          set_delivery_details([
            { ...delivery_details[0], destination: e.target.value },
          ])
        }
        value={delivery_details[0].destination}
      ></input>
      <br />
      <label htmlFor="quantity">Quantity</label>
      <input
        type="text"
        id="quantity"
        onChange={(e) =>
          set_delivery_details([
            { ...delivery_details[0], quantity: Number(e.target.value) },
          ])
        }
        value={delivery_details[0].quantity}
      ></input>
      <br />
      <label htmlFor="store">Store_manager</label>
      <select>
        <option value={delivery_details[0].store}></option>//list of store
        address and their names and location
      </select>
      <br />
      <label htmlFor="transporter">Transporter</label>
      <select>
        <option value={delivery_details[0].transporter}></option>//list of
        transporter addressand ther names and location
      </select>
      <p>{get_status_message()}</p>
      <button
        onClick={() => deliver.mutate(delivery_details[0])}
        className={`${isSubmitting && "opacity-50 cursor-not-allowed"}`}
        type="submit"
      >
        {get_button_message()}
      </button>
    </form>
  );

  const upload_form = (
    <form>
      <label htmlFor="name">Name of product</label>
      <input
        type="text"
        id="name"
        value={upload_details[0].name}
        onChange={(e) =>
          set_upload_details([{ ...upload_details[0], name: e.target.value }])
        }
      ></input>
      <br />
      <label htmlFor="harvestDate">Date of Harvest</label>
      <input
        type="date"
        id="harvestDate"
        value={upload_details[0].harvestDate}
        onChange={(e) =>
          set_upload_details([
            { ...upload_details[0], harvestDate: e.target.value },
          ])
        }
      ></input>
      <br />
      <label htmlFor="quantity"></label>
      <input
        type="text"
        id="quantity"
        value={upload_details[0].quantity}
        onChange={(e) =>
          set_upload_details([
            { ...upload_details[0], quantity: Number(e.target.value) },
          ])
        }
      ></input>
      <br />
      {upload_txHash && <p>{`${upload_txHash}`}</p>}
      <p>{get_status_message()}</p>
      <button
        onClick={() => upload.mutate(upload_details[0])}
        className={`${isSubmitting && "opacity-50 cursor-not-allowed"}`}
        type="submit"
      >
        Done
      </button>
    </form>
  );
  return (
    <div>
      <h1>Dashboard</h1>
      <button
        onClick={() => {
          set_display_upload_form(true);
          set_display_delivery_form(false);
        }}
      >
        upload a crop
      </button>
      <Link to="farmer_history">View History</Link>
      <section>
        <table>
          <thead>
            <tr className=" bg-white w-full py-3 text-black text-[20px] font-bold">
              <td className="w-fit-content h-[5px] bg-gray-400 p-5">ID</td>
              <td>name</td>
              <td>quantity</td>
              <td>harvestDate</td>
              <td>store</td>
              <td>action</td>
            </tr>
          </thead>
          {isLoading ? (
            <tr>
              <td>Loading Date</td>
            </tr>
          ) : (
            <tbody>
              {available_products.map((crop, id) => (
                <tr>
                  <td key={id}>{crop.id}</td>
                  <td key={id}>{crop.name}</td>
                  <td key={id}>{crop.quantity}</td>
                  <td key={id}>{crop.harvestDate}</td>
                  <td key={id}>{crop.farmer}</td>
                  <td key={id}>
                    <button
                      onClick={() => {
                        set_display_delivery_form(true);
                        set_display_upload_form(false);
                        set_current_cropId(Number(crop.id));
                        set_delivery_details([
                          { ...delivery_details[0], crop_id: current_cropId! },
                        ]);
                      }}
                    >
                      Send to store
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </section>
      {display_delivery_form && delivery_form}
      {display_upload_form && upload_form}
    </div>
  );
};

export default Farmer_dashboard;
