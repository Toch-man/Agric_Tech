import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { readContract } from "wagmi/actions";
import { useAccount } from "wagmi";
import { wagmiContractConfig } from "../../contracts/contract";
import { config } from "../../wagmi";

type transporter_chain = {
  id: string;
  farmer: `0x${string}`;
  store: `0x${string}`;
  farmer_name: string;
  store_name: string;
  crop_name: string;
  from: string;
  to: string;
  date: any;
};

const Transporter_history = () => {
  const [transporter_chain, set_transporter_chain] = useState<
    transporter_chain[] | []
  >([]);
  const { address, isConnected } = useAccount();

  const { data: transporter_history_count, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "transporter_history_count",
    args: [address],
    query: { enabled: !!address },
  });

  useEffect(() => {
    async function get_transporter_history_byIndex() {
      const count = Number(transporter_history_count);
      const history = Array.from({ length: count }, () => {
        return readContract(config, {
          ...wagmiContractConfig,
          functionName: "get_transporter_history_byIndex",
          args: [address],
        });
      });
      const values = await Promise.all(history);
      const result: transporter_chain[] = values.map((item: any) => ({
        id: item[0],
        farmer: item[1],
        store: item[2],
        farmer_name: item[3],
        store_name: item[4],
        crop_name: item[5],
        from: item[6],
        to: item[7],
        date: item[8],
      }));
      set_transporter_chain(result);
    }
    get_transporter_history_byIndex();
  }, [address, isConnected, transporter_history_count]);

  return (
    <div>
      <h1>Deliveries history</h1>
      <table>
        <thead>
          <tr>
            <td>id</td>
            <td>farmer_address</td>
            <td>store_address</td>
            <td>farmer_name</td>
            <td>Name of store</td>
            <td>Crop name</td>
            <td>from</td>
            <td>to</td>
            <td>date</td>
          </tr>
        </thead>
        <tbody>
          {transporter_chain.map((chain, id) => (
            <tr key={id}>
              <td>{chain.id}</td>
              <td>{chain.farmer}</td>
              <td>{chain.store}</td>
              <td>{chain.farmer_name}</td>
              <td>{chain.store_name}</td>
              <td>{chain.crop_name}</td>
              <td>{chain.from}</td>
              <td>{chain.to}</td>
              <td>{chain.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transporter_history;
