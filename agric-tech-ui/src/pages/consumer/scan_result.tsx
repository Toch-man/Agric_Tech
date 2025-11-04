import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { readContract } from "wagmi/actions";
import { config } from "../../wagmi";
import { wagmiContractConfig } from "../../contracts/contract";
import { getUserName } from "../../get_user_name";
import type { product_details } from "../../dashboard/store/store";

export default function Scan_result() {
  const { id } = useParams();
  const [product, setProduct] = useState<product_details | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);

        const value: any = await readContract(config, {
          ...wagmiContractConfig,
          functionName: "get_product_byIndex",
          args: [BigInt(id || "0")],
        });

        const farmer_name = await getUserName(value[2]);
        const transporter_name = await getUserName(value[3]);
        const store_name = await getUserName(value[4]);

        const harvest_timestamp = Number(value[5]) * 1000;
        const harvest_date = new Date(harvest_timestamp).toLocaleDateString(
          "en-US",
          { day: "numeric", month: "short", year: "numeric" }
        );

        const arrival_timestamp = Number(value[8]) * 1000;
        const arrival_date = new Date(arrival_timestamp).toLocaleDateString(
          "en-US",
          { day: "numeric", month: "short", year: "numeric" }
        );

        const result: product_details = {
          id: value[0]?.toString(),
          name: value[1],
          owner: farmer_name,
          transporter: transporter_name,
          store: store_name,
          harvestDate: harvest_date,
          quantity: Number(value[6]),
          price_per_unit: Number(value[7]),
          arrival_date: arrival_date,
        };

        setProduct(result);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mr-2" />
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Product not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6E5] to-[#FCE6CF] p-6 flex justify-center">
      <div className="max-w-2xl bg-white shadow-lg rounded-3xl p-8 border border-[#F9D7B0]">
        <h1 className="text-3xl font-bold text-[#15234D] mb-6 text-center">
          {product.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Product ID</p>
            <p className="font-semibold text-[#15234D]">{product.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Farmer</p>
            <p className="font-semibold text-[#E9990B]">{product.owner}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Transporter</p>
            <p className="font-semibold text-[#E9990B]">
              {product.transporter}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Store</p>
            <p className="font-semibold text-[#E9990B]">{product.store}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Quantity</p>
            <p className="font-semibold text-[#15234D]">{product.quantity}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price per Unit</p>
            <p className="font-semibold text-[#15234D]">
              {product.price_per_unit}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Harvest Date</p>
            <p className="font-semibold text-[#15234D]">
              {product.harvestDate}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Arrival Date</p>
            <p className="font-semibold text-[#15234D]">
              {product.arrival_date}
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-[#15234D] text-white rounded-2xl hover:bg-[#0f1a3a] transition-all"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
