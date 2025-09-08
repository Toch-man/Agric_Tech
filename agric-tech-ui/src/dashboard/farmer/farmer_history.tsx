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
  }, [address, isConnected, farmer_history_count]); //the will runn anytime the farmer history fetched from the blockchain changes
  return (
    <div>
      <h1>Supply history</h1>
      <table>
        <thead>
          <tr>
            <td>id</td>
            <td>name</td>
            <td>owner's address</td>
            <td>Store name</td>
            <td>Transporter's name</td>
            <td>date</td>
          </tr>
        </thead>
        <tbody>
          {farmer_history.map((chain, id) => (
            <tr>
              <td key={id}>{chain.id}</td>
              <td key={id}>{chain.product_name}</td>
              <td key={id}>{chain.farmer}</td>
              <td key={id}>{chain.sent_to}</td>
              <td key={id}>{chain.through}</td>

              <td key={id}>{chain.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Farmer_history;
