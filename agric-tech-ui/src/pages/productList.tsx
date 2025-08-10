import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { config } from "../wagmi";
import { readContract } from "wagmi/actions";
import { useWriteContract } from "wagmi";
import { useWaitForTransactionReceipt } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { parseEther } from "viem";
import { wagmiContractConfig } from "../contracts/contract";
import Header from "../layout/header";

import { useAccount } from "wagmi";

type product = {
  id: string;
  name: string;
  price: number;
  owner: string;
};

export default function User_dashboard() {
  const { address, isConnected } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [celo_price, set_celo_price] = useState(0);
  const [quantity, set_quantity] = useState<string | number>(1);
  const [txHash, set_txHash] = useState<`0x${string}` | undefined>(undefined);
  const [available_products, set_available_products] = useState<product[]>([]);

  const { writeContractAsync } = useWriteContract();

  const { data: product_count, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "get_product_count",
    query: { enabled: !!address },
  });

  //fetch products from blockchain
  useEffect(() => {
    async function get_products() {
      if (isConnected) {
        const count = Number(product_count);
        const products = Array.from({ length: count }, (_, i) => {
          return readContract(config, {
            ...wagmiContractConfig,
            functionName: "get_product_by_index",
            args: [BigInt(i)],
          });
        });

        const values = await Promise.all(products);
        const result: product[] = values.map((item: any) => ({
          id: item[0],
          name: item[1],
          owner: item[2],
          price: item[3] && Number(item[3]),
        }));
        set_available_products(result);
      }
    }

    get_products();
  }, [isConnected]);

  //confirm transaction
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

  //fetch conversion rate of dollar to celo
  useEffect(() => {
    const fetch_celo_price = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd"
        );
        const data = await res.json();
        set_celo_price(data.celo.usd);
      } catch (error) {
        set_celo_price(0.8);
        console.log(error);
      }
    };

    fetch_celo_price();
    const interval = setInterval(fetch_celo_price, 30000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  //error handling
  useEffect(() => {
    if (isConfirmationError) {
      setIsSubmitting(false);
      console.error("Transaction confirmation error:", confirmationError);
    }
  }, [isConfirmationError, confirmationError]);

  //purchase crops
  const buy = useMutation({
    mutationFn: async (data: {
      crop_id: string;
      quantity: string;
      product: product;
    }) => {
      try {
        if (!isConnected) return;

        setIsSubmitting(true);
        const dollar_price = data.product.price * Number(quantity);
        const celo_amount = dollar_price / celo_price;
        const celo_amount_inWei = parseEther(celo_amount.toString()); //convert to wei
        const hash = await writeContractAsync({
          ...wagmiContractConfig,
          functionName: "buyCrop",
          args: [data.crop_id, data.quantity],
          value: celo_amount_inWei,
        });

        set_txHash(hash);
        setIsSubmitting(false);
        return hash;
      } catch (error) {
        setIsSubmitting(false);
      }
    },
  });

  function get_status_message() {
    if (isConfirmed) return "Transaction successful";
    if (buy.isPending && !txHash) return "preparing transaction...";
    if (txHash && !isConfirmationError && !isConfirmed)
      return "Confirming transaction";
    if (isConfirmationError) return "Transaction failed. Please try again.";
    if (isConfirmed) return "Success! Redirecting to dashboard...";
    return null;
  }

  function get_button_message() {
    if (buy.isPending) return "Preparing";
    return "Buy product";
  }

  return (
    <Header>
      <button> View History</button>
      {isLoading && <p>Loading available products</p>}
      <section className="max-w-screen p-3 mx-50 mt-[100px] shadow-2xl">
        {available_products.length == 0 && !isLoading ? (
          <p>NO products available at the moment</p>
        ) : (
          <div className="grid grid-cols-5 gap-3">
            {available_products.map((product: product, id: number) => (
              <div
                className="flex flex-col h-fit-content bg-gray-300 p-2"
                key={id}
              >
                <img
                  className="w-15 h-15"
                  src="/images/metamask.svg"
                  alt={`${product.name}`}
                ></img>
                <p className="text-black font-bold text-lg">{product.name}</p>
                <p className="text-black text-xs">USD {product.price}</p>
                <p className="text-black text-xs">{`${product.owner.slice(0, 2)}...${product.owner.slice(-3)}`}</p>
                <div className="mb-2">
                  <label htmlFor="quantity" className="text-xs text-black">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    onChange={(e) => set_quantity(e.target.value)}
                    value={quantity}
                    className="w-full px-2 py-1 text-xs border rounded"
                  ></input>
                  {get_status_message() && (
                    <div
                      className={`p-3 rounded mb-4 ${
                        isConfirmationError
                          ? "bg-red-100 text-red-700"
                          : isConfirmed
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {get_status_message()}
                    </div>
                  )}

                  {/* Transaction Hash */}
                  {txHash && (
                    <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                      <p>Transaction Hash:</p>
                      <p className="break-all font-mono">{txHash}</p>
                    </div>
                  )}

                  {/* Error Display */}
                  {buy.error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                      {(buy.error as any)?.message || "An error occurred"}
                    </div>
                  )}
                  <button
                    onClick={() =>
                      buy.mutate({
                        quantity: quantity,
                        crop_id: product.id,
                        product,
                      })
                    }
                    className={`w-full h-[50px] rounded font-medium transition-colors ${
                      isSubmitting || buy.isPending || !isConnected
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {get_button_message()}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Header>
  );
}
