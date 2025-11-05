import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { Link } from "react-router-dom";
import { readContract } from "wagmi/actions";
import { config } from "../../wagmi";
import { getUserName } from "../../get_user_name";

import { wagmiContractConfig } from "../../contracts/contract";

export type product_details = {
  id: string;
  name: string;
  owner: string;
  transporter: string;
  store: string;
  harvestDate: string;
  quantity: number;
  price_per_unit: number;
  arrival_date: string;
};

const Store_dashboard = () => {
  const { address, isConnected } = useAccount();

  const [display_products, set_display_products] = useState<
    product_details[] | []
  >([]);
  const [deliveryCount, set_delivery_count] = useState(0);

  const { data: product_count, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "get_store_product_count",
    query: { enabled: !!address },
  });
  const { data: delivery_count } = useReadContract({
    ...wagmiContractConfig,
    functionName: "get_delivery_count",
    query: { enabled: !!address },
  });

  useEffect(() => {
    async function get_product_byIndex() {
      if (!isConnected || !product_count) return;

      const count = Number(product_count);
      if (count === 0) {
        set_display_products([]);
        return;
      }

      const products = Array.from({ length: count }, (_, i) => {
        return readContract(config, {
          ...wagmiContractConfig,
          functionName: "get_product_byIndex",

          args: [BigInt(i + 1)],
        });
      });

      const values = await Promise.all(products);
      const result: product_details[] = await Promise.all(
        values.map(async (item: any) => {
          const farmer_name = await getUserName(item[2]);
          const transporter_name = await getUserName(item[3]);
          const store_name = await getUserName(item[4]);

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
            id: item[0]?.toString(),
            name: item[1],
            owner: farmer_name,
            transporter: transporter_name,
            store: store_name,
            harvestDate: harvest_date,
            quantity: Number(item[6]),
            price_per_unit: Number(item[7]),
            arrival_date: arrival_date,
          };
        })
      );

      set_display_products(result);
      set_delivery_count(Number(deliveryCount));
    }

    get_product_byIndex();
  }, [address, isConnected, product_count, delivery_count]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Store Dashboard
            </h1>

            {/* Navigation Links */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/store/deliveries"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                View Expecting Deliveries
              </Link>
              <Link
                to="/store/product_in_store"
                className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Generate QR Code for product
              </Link>
              <Link
                to="/store/history"
                className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                View History
              </Link>
            </div>
          </div>
        </div>

        {/* Record Shipment Section */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Record Shipment
            </h2>
            <p className="text-gray-600 mt-1">
              Track and manage your store products and deliveries
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading products...</p>
            </div>
          )}

          {/* No Products State */}
          {!isLoading && display_products.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2h16zm0-5a2 2 0 00-2-2H6a2 2 0 00-2 2m16 0h-2m-2 0h-4m-4 0H6m0 0h2m2 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Products Found
              </h3>
              <p className="text-gray-600">
                Products not found in store. New deliveries will appear here.
              </p>
            </div>
          )}

          {/* Products Table - Desktop View */}
          {!isLoading && display_products.length > 0 && (
            <div className="hidden lg:block overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price per unit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transporter
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arrival Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {display_products.map((product, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.price_per_unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                        {product.owner}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                        {product.transporter}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.arrival_date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Products Cards - Mobile/Tablet View */}
          {!isLoading && display_products.length > 0 && (
            <div className="lg:hidden p-4">
              <div className="space-y-4">
                {display_products.map((product, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ID: {product.id}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Qty: {product.quantity}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Owner
                        </p>
                        <p className="text-sm font-mono text-gray-900">
                          {`${product.owner.slice(
                            0,
                            8
                          )}...${product.owner.slice(-6)}`}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Transporter
                        </p>
                        <p className="text-sm font-mono text-gray-900">
                          {`${product.transporter.slice(
                            0,
                            8
                          )}...${product.transporter.slice(-6)}`}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Arrival Date
                        </p>
                        <p className="text-sm text-gray-900">
                          {product.arrival_date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {display_products.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Quantity
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {display_products.reduce(
                    (sum, product) => sum + product.quantity,
                    0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Pending Deliveries
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {deliveryCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Transporters
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(display_products.map((p) => p.transporter)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Store_dashboard;
