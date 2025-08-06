import Header from "../layout/header";
import { useAccount, useReadContract } from "wagmi";
import { wagmiContractConfig } from "../contracts/contract";
import { useEffect, useState } from "react";
export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [supplies, setSupplies] = useState<any[]>([]);
  const { data: supplyCount, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getSupply",
    args: address ? [address] : [],
    query: { enabled: !!address },
  });

  useEffect(() => {
    async function fetchAllSupplies() {
      if (!supplyCount || !address || !isConnected) return;

      const count = Number(supplyCount);

      const promises = Array.from({ length: count }, (_, i) =>
        useReadContract({
          ...wagmiContractConfig,
          functionName: "getSupplyByIndex",
          args: [address, BigInt(i)],
        })
      );

      const results = await Promise.all(promises);
      setSupplies(results);
    }

    fetchAllSupplies();
  }, [supplyCount, address]);

  return (
    <Header>
      {isLoading ? (
        <p>Loading farmer data...</p>
      ) : (
        <div>
          <div>Farm Statistics</div>
          <section>
            <table>
              <thead>
                <tr>
                  <td>id</td>
                  <td>Buyer's Address</td>
                  <td>Product Name</td>
                  <td>Quantity</td>
                  <td>Total cost</td>
                </tr>
              </thead>
              <tbody>
                {supplies.map((supply, id) => (
                  <tr>
                    <td key={id}>{supply.id}</td>
                    <td key={id}>{supply.customerAddress}</td>
                    <td key={id}> {supply.nameOfProduct}</td>
                    <td key={id}>{supply.quantity}</td>
                    <td key={id}>{supply.totalCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </Header>
  );
}
