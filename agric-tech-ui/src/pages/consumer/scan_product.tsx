import { QrReader } from "react-qr-reader";
import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { readContract } from "wagmi/actions";
import { wagmiContractConfig } from "../../contracts/contract";
import { config } from "../../wagmi";
import { getUserName } from "../../get_user_name";
import Header from "../../layouts/header";

type ProductChain = {
  crop_id: string;
  name: string;
  owner: string;
  transporter: string;
  store: string;
  harvestDate: number;
  quantity: number;
  price_per_unit: number;
  arrival_date: number;
};

const Scan_products = () => {
  const [data, set_data] = useState<string>("");
  const [product, set_product] = useState<ProductChain[]>([]);
  const [fetching, set_fetching] = useState(false);
  const { data: product_count } = useReadContract({
    ...wagmiContractConfig,
    functionName: "get_store_product_count",
    query: { enabled: !!data },
  });
  useEffect(() => {
    async function scanned_result() {
      if (!data) return;
      set_fetching(true);
      const count = Number(product_count);
      const store_products = Array.from({ length: count }, (_, i) =>
        readContract(config, {
          ...wagmiContractConfig,
          functionName: "get_product_byIndex",
          args: [BigInt(i)],
        })
      );

      const all = await Promise.all(store_products);
      const values = all.filter(
        (p: any) => p[0]?.toLowerCase() === data?.toLowerCase()
      );

      const farm_name = await Promise.all(
        values.map((p: any) => getUserName(p[2]))
      );

      const transporter_name = await Promise.all(
        values.map((p: any) => getUserName(p[3]))
      );

      const store_name = await Promise.all(
        values.map((p: any) => getUserName(p[4]))
      );

      const result: ProductChain[] = values.map((item: any, i: number) => ({
        crop_id: item[0],
        name: item[1],
        owner: String(farm_name[i]),
        transporter: String(transporter_name[i]),
        store: String(store_name[i]),
        harvestDate: item[5],
        quantity: item[6],
        price_per_unit: item[7],
        arrival_date: item[8],
      }));
      set_product(result);
      set_fetching(false);
    }

    scanned_result();
  }, [data]);
  return (
    <Header>
      <div className="min-h-screen bg-gray-50 p-4">
        {/* Scanner Box */}
        <div className="w-full max-w-md mx-auto mb-6 bg-white p-4 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-center mb-4 text-gray-700">
            Scan Product QR Code
          </h1>
          <div className="rounded-lg overflow-hidden border border-gray-300">
            <QrReader
              onResult={(result, error) => {
                if (result) set_data(result.getText());
                if (error) console.info(error);
              }}
              constraints={{ facingMode: "environment" }}
            />
          </div>
          {data && (
            <p className="text-center mt-4 text-green-600 font-medium break-words">
              Scanned ID: {data}
            </p>
          )}
        </div>

        {/* Product Table */}
        {data && product.length > 0 && !fetching && (
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-blue-500 text-white text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Farm</th>
                  <th className="px-4 py-3">Transporter</th>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">Harvest Date</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Arrival Date</th>
                </tr>
              </thead>
              <tbody>
                {product.map((p) => (
                  <tr
                    key={p.crop_id}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">{p.crop_id}</td>
                    <td className="px-4 py-2">{p.name}</td>
                    <td className="px-4 py-2">{p.owner}</td>
                    <td className="px-4 py-2">{p.transporter}</td>
                    <td className="px-4 py-2">{p.store}</td>
                    <td className="px-4 py-2">
                      {new Date(p.harvestDate * 1000).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">{p.quantity}</td>
                    <td className="px-4 py-2">${p.price_per_unit}</td>
                    <td className="px-4 py-2">
                      {new Date(p.arrival_date * 1000).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && product.length === 0 && (
          <p className="text-center mt-6 text-gray-600">
            No product details loaded yet.
          </p>
        )}
      </div>
    </Header>
  );
};

export default Scan_products;
