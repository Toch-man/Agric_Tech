import Header from "../layout/header";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { MdArrowBack } from "react-icons/md";
import { config } from "../wagmi";
import { readContract } from "wagmi/actions";
import { useMutation } from "@tanstack/react-query";
import { useWaitForTransactionReceipt } from "wagmi";
import { wagmiContractConfig } from "../contracts/contract";
import { parseEther } from "viem";
import { FormEvent, useEffect, useState } from "react";
export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [name, setName] = useState("");
  const [price_per_unit, set_price_per_unit] = useState("");
  const [error_message, set_error_message] = useState("");
  const [quantity, set_quantity] = useState("");
  const [isSubmitting, set_is_submitting] = useState(false);
  const [show_form, set_show_form] = useState(false);
  const [txHash, set_txHash] = useState<`0x${string}` | undefined>(undefined);
  const [supplies, setSupplies] = useState<any[]>([]);

  const { data: supplyCount, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getSupply",
    args: address ? [address] : [],
    query: { enabled: !!address },
  });

  const { writeContractAsync } = useWriteContract();

  const {
    isSuccess: isConfirmed,
    isError: isConfirmationError,
    error: confirmationError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
    query: {
      enabled: !!txHash,
      retry: 3,
      retryDelay: 1000,
    },
  });

  const upload = useMutation({
    mutationFn: async (formData: {
      name: string;
      price: string;
      quantity: string;
    }) => {
      set_is_submitting(true);
      try {
        const hash = await writeContractAsync({
          ...wagmiContractConfig,
          functionName: "uploadCrop",
          args: [formData.name, formData.price, formData.quantity],
        });
        console.log("transaction hash", hash);
        set_txHash(hash);
      } catch (error) {
        console.log(error);
      }
      set_is_submitting(false);
      set_quantity("");
      set_price_per_unit("");
      setName("");
    },
  });

  useEffect(() => {
    async function fetchSupplies() {
      const count = Number(supplyCount);

      const promises = Array.from({ length: count }, (_, i) =>
        readContract(config, {
          ...wagmiContractConfig,
          functionName: "getSupplyByIndex",
          args: [address, BigInt(i)],
        })
      );

      try {
        const result = await Promise.all(promises);
        setSupplies(result);
      } catch (error) {
        console.log("failed to fetch supplies");
      }
    }
    fetchSupplies();
  }, []);

  useEffect(() => {
    if (confirmationError) {
      set_is_submitting(false);
      set_error_message(`transaction confirmation error:${confirmationError}`);
    }
    if (isConfirmed) {
      set_is_submitting(false);
      setTimeout(() => {
        set_show_form(false);
      }, 2000);
    }
  }, [isConfirmationError, confirmationError, isConfirmed]);

  //convert usdt to eth
  const usd_to_eth = async (usd_amt: string) => {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );
    const data = await res.json();
    const eth_in_usd = data.ethereum.usd;
    const eth_amt = Number(usd_amt) / eth_in_usd;
    return eth_amt;
  };

  const handle_submit = async (e: FormEvent) => {
    e.preventDefault();
    const price_in_eth = await usd_to_eth(price_per_unit);
    const price_in_wei = parseEther(String(price_in_eth));
    upload.mutate({
      name: name.trim(),
      price: price_in_wei.toString(),
      quantity: quantity.trim(),
    });
  };

  const get_button_message = () => {
    if (isSubmitting) return "Processing";
    if (upload.isPending) return "Preparing";
    return "Upload";
  };

  const get_status_message = () => {
    if (upload.isPending && !txHash) return "Preparing transaction";
    if (txHash && !isConfirmed && !isConfirmationError)
      return "Waiting for confirmation...";
    if (isConfirmationError || confirmationError)
      return `transaction failed ${confirmationError}`;
    if (isConfirmed) return "Success! Redirecting to dashboard...";
    return null;
  };

  const crop_form = (
    <div className=" absolute flex left-1/3 top-1/3 p-[50px]  bg-white lg:w-[500px] lg:h-[400px] shadow-2xl border-black-600">
      <button
        className="flex absolute top-2 left-2 not-last:z-50 gap-2"
        onClick={() => set_show_form(false)}
      >
        <MdArrowBack size={24} />
        Back
      </button>
      <form onSubmit={handle_submit}>
        <label htmlFor="name" className="block mb-2 font-medium">
          {" "}
          Crop name
        </label>
        <input
          className="w-full p-2 border-2 border-green-300 rounded"
          id="name"
          type="text"
          value={name}
          placeholder="Enter crop name"
          onChange={(e) => setName(e.target.value)}
        ></input>
        <label htmlFor="price" className="block mb-2 font-medium">
          Price
        </label>
        <input
          className="w-full p-2 border-2 border-green-300 rounded"
          id="price"
          type="text"
          step="0.001"
          min="0.001"
          value={price_per_unit}
          placeholder="0.01"
          onChange={(e) => set_price_per_unit(e.target.value)}
        ></input>
        <label htmlFor="quantity" className="block mb-2 font-medium">
          {" "}
          Quantity
        </label>
        <input
          className="w-full p-2 border-2 mb-10 border-green-300 rounded"
          id="quantity"
          type="text"
          value={quantity}
          placeholder="enter available quantity"
          onChange={(e) => set_quantity(e.target.value)}
        ></input>
        {isSubmitting && (
          <p
            className={`${
              isSubmitting || upload.isPending || isConnected || error_message
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {get_status_message()}
          </p>
        )}
        <button
          className={`w-full h-[50px] rounded font-medium transition-colors ${
            isSubmitting || upload.isPending || !isConnected || !isConfirmed
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {get_button_message()}
        </button>
      </form>
    </div>
  );

  return (
    <Header>
      {isLoading ? (
        <p>Loading farmer data...</p>
      ) : (
        <div className="relative flex-col p-5">
          <div>Farm Statistics</div>
          <button
            onClick={() => set_show_form(true)}
            className="bg-green-500 flex float-right items-center justify-center w-fit-content font-bold text-[15px] text-center px-3 h-[40px]"
          >
            Upload New Product
          </button>
          <section className=" flex justify-center mt-20">
            <table>
              <thead>
                <tr className=" bg-white w-full py-3 text-black text-[20px] font-bold">
                  <td className="w-fit-content h-[5px] bg-gray-400 p-5">id</td>
                  <td className="w-fit-content h-[5px] bg-gray-400 p-5">
                    Buyer's Address{" "}
                  </td>
                  <td className="w-fit-content h-[5px] bg-gray-400 p-5">
                    Product Name
                  </td>
                  <td className="w-fit-content h-[5px] bg-gray-400 p-5">
                    Quantity
                  </td>
                  <td className="w-fit-content h-[5px] bg-gray-400 p-5">
                    Total cost
                  </td>
                </tr>
              </thead>
              <tbody>
                {supplies.map((supply, id) => (
                  <tr
                    className={`${id % 2 == 0 ? "bg-gray-400" : "bg-white"} w-full h-[20px] py-3 px-10 text-black text-[15px]`}
                  >
                    <td key={id}>{supply.id}</td>
                    <td key={id}>{supply.customerAddress}</td>
                    <td key={id}>{supply.nameOfProduct}</td>
                    <td key={id}>{supply.quantity}</td>
                    <td key={id}>{supply.totalCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          {show_form && <div>{crop_form}</div>}
        </div>
      )}
    </Header>
  );
}
