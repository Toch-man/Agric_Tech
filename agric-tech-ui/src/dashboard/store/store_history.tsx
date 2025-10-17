import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { config } from "../../wagmi";
import { wagmiContractConfig } from "../../contracts/contract";
import { readContract } from "wagmi/actions";

type Store_chain = {
  id: string;
  farmer: `0x${string}`;
  transporter: `0x${string}`;
  farmer_name: string;
  transporter_name: string;
  date: any;
  product_name: string;
  quantity: number;
};

const Store_history = () => {
  const [store_chain, set_store_chain] = useState<Store_chain[] | []>([]);
  const { address, isConnected } = useAccount();

  const { data: store_history_count, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "store_history_count",
    args: [address],
    query: { enabled: !!address },
  });

  useEffect(() => {
    async function get_store_history() {
      if (!isConnected) return;
      const count = Number(store_history_count);
      const history = Array.from({ length: count }, () => {
        return readContract(config, {
          ...wagmiContractConfig,
          functionName: "get_store_history_byIndex",
          args: [address],
        });
      });
      const values = await Promise.all(history);
      const result = values.map((item: any) => ({
        id: item[0],
        farmer: item[1],
        transporter: item[2],
        farmer_name: item[3],
        transporter_name: item[4],
        date: item[5],
        product_name: item[6],
        quantity: item[7],
      }));
      set_store_chain(result);
    }
    get_store_history();
  }, [store_history_count]);

  return (
    <div>
      <h1>Store History</h1>
      <table>
        <thead>
          <tr>
            <td>id</td>
            <td>farmer address</td>
            <td>transporter address</td>
            <td>farmer_name</td>
            <td>transporter_name</td>
            <td>product_name</td>
            <td>quantity</td>
            <td>date</td>
          </tr>
        </thead>
        <tbody>
          {store_chain.map((chain, id) => (
            <tr key={id}>
              <td>{chain.id}</td>
              <td>{chain.farmer}</td>
              <td>{chain.transporter}</td>
              <td>{chain.farmer_name}</td>
              <td>{chain.transporter_name}</td>
              <td>{chain.product_name}</td>
              <td>{chain.quantity}</td>
              <td>{chain.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Store_history;
