import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useReadContract } from "wagmi";
import { wagmiContractConfig } from "../../contracts/contract";
import { readContract } from "wagmi/actions";
import { config } from "../../wagmi";
import { QRCodeCanvas } from "qrcode.react"; //  use qrcode.react
import { Dialog } from "@headlessui/react";
import { MdSearch } from "react-icons/md";
import { getUserName } from "../../get_user_name";

type product = {
  crop_id: string;
  name: string;
  owner: string;
  transporter: string;
  store: string;
  harvestDate: string;
  quantity: number;
  price_per_unit: number;
  arrival_date: string;
};

const Product_in_store = () => {
  const { address, isConnected } = useAccount();
  const [searchBox, set_searchBox] = useState("");
  const [products, set_products] = useState<product[]>([]);
  const [fetching, set_fetching] = useState(false);
  const [qrOpen, set_qrOpen] = useState(false);
  const [selectedId, set_selectedId] = useState<string>("");

  const { data: product_count } = useReadContract({
    ...wagmiContractConfig,
    functionName: "get_store_product_count",
    query: { enabled: !!address },
  });

  useEffect(() => {
    async function fetch_products() {
      if (!isConnected) return;
      set_fetching(true);
      const count = Number(product_count);
      const store_products = Array.from({ length: count }, (_, i) =>
        readContract(config, {
          ...wagmiContractConfig,
          functionName: "get_product_byIndex",
          args: [BigInt(i + 1)],
        })
      );

      const all = await Promise.all(store_products);
      const values = all.filter(
        (p: any) => p[4]?.toLowerCase() === address?.toLowerCase()
      );

      const farmer_name = await Promise.all(
        values.map((p: any) => getUserName(p[2]))
      );

      const transporter_name = await Promise.all(
        values.map((p: any) => getUserName(p[3]))
      );

      const store_name = await Promise.all(
        values.map((p: any) => getUserName(p[4]))
      );

      const result: product[] = values.map((item: any, i: number) => {
        const harvestTimestamp = Number(item[5]);
        const harvest_date = new Date(harvestTimestamp).toLocaleDateString(
          "en-US",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        );

        const arrivalTimestamp = Number(item[8]);
        const arrival_date = new Date(arrivalTimestamp).toLocaleDateString(
          "en-US",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        );
        return {
          crop_id: item[0],
          name: item[1],
          owner: String(farmer_name[i]),
          transporter: String(transporter_name[i]),
          store: String(store_name[i]),
          harvestDate: harvest_date,
          quantity: Number(item[6]),
          price_per_unit: Number(item[7]),
          arrival_date: arrival_date,
        };
      });
      set_products(result);
      set_fetching(false);
    }
    fetch_products();
  }, [address, product_count]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchBox.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Store Products</h1>
        <div className="relative w-full md:w-1/3">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            <MdSearch />
          </div>

          <input
            type="text"
            placeholder="Search product..."
            value={searchBox}
            onChange={(e) => set_searchBox(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow rounded-lg">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Farmer</th>
              <th className="p-3 text-left">Quantity</th>
              <th className="p-3 text-left">Price_per_unit</th>
              <th className="p-3 text-left">Harvest Date</th>
              <th className="p-3 text-left">Arrival Date</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  Loading products...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  No products found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.crop_id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{p.crop_id}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.owner}</td>
                  <td className="p-3">{p.quantity}</td>
                  <td className="p-3">{p.price_per_unit}</td>
                  <td className="p-3">{p.harvestDate}</td>
                  <td className="p-3">{p.arrival_date}</td>
                  <td className="p-3">
                    <button
                      onClick={() => {
                        set_selectedId(p.crop_id);
                        set_qrOpen(true);
                      }}
                      className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                    >
                      Generate QR Code
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* QR Code Popup */}
      <Dialog
        open={qrOpen}
        onClose={() => set_qrOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      >
        <Dialog.Panel className="bg-white p-6 rounded shadow-lg flex flex-col items-center gap-4">
          <Dialog.Title className="text-xl font-bold">
            Product QR Code
          </Dialog.Title>

          {/*  QRCode from qrcode.react */}
          <QRCodeCanvas
            value={`${window.location.origin}/product/${selectedId}`}
            size={200}
            level="H"
            includeMargin={true}
          />

          <button
            onClick={() => window.print()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Print
          </button>
          <button
            onClick={() => set_qrOpen(false)}
            className="mt-2 text-red-500 hover:underline"
          >
            Close
          </button>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
};

export default Product_in_store;
