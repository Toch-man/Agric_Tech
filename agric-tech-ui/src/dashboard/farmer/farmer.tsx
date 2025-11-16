import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { config } from "../../wagmi";
import { readContract } from "wagmi/actions";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getUserName } from "../../get_user_name";
import { wagmiContractConfig } from "../../contracts/contract";

type Crop = {
  id: number;
  crop_id: string;
  name: string;
  quantity: string;
  harvestDate: string;
  farmer: `0x${string}`;
  status: string;
  farmer_name: string;
};
type deliverDetails = {
  id: number;
  quantity: number;
  store: `0x${string}`;
  transporter: `0x${string}`;
  pick_up_location: string;
  destination: string;
};
type uploadDetails = {
  name: string;
  product_id: string;
  quantity: number;
  price_per_unit: number;
  harvestDate: string;
};

const Farmer_dashboard = () => {
  const { address, isConnected } = useAccount();
  const [storeManagers, setStoreManagers] = useState<
    {
      address: string;
      name: string;
      location: string;
      successful_delivery: number;
    }[]
  >([]);
  const [transporters, setTransporters] = useState<
    {
      address: string;
      name: string;
      location: string;
      successful_delivery: number;
    }[]
  >([]);
  const [isSubmitting, set_isSubmitting] = useState(false);
  const [available_products, set_available_products] = useState<Crop[] | []>(
    []
  );

  const [upload_txHash, set_upload_txHash] = useState<
    `0x${string}` | undefined
  >(undefined);
  const [txHash, set_txHash] = useState<`0x${string}` | undefined>(undefined);
  const [farmerLocation, setFarmerLocation] = useState<string>("");
  const [display_delivery_form, set_display_delivery_form] = useState(false);
  const [display_upload_form, set_display_upload_form] = useState(false);
  const [delivery_details, set_delivery_details] = useState<
    deliverDetails[] | []
  >([]);
  const [upload_details, set_upload_details] = useState<uploadDetails[] | []>(
    []
  );

  const { writeContractAsync } = useWriteContract();
  const {
    data: aval_products_count,
    isLoading,
    refetch,
  } = useReadContract({
    ...wagmiContractConfig,
    functionName: "crop_count",
    query: { enabled: !!address },
  });

  const { data: storeManagerAddresses } = useReadContract({
    ...wagmiContractConfig,
    functionName: "list_user_address",
    args: [2],
  });

  const { data: transporterAddresses } = useReadContract({
    ...wagmiContractConfig,
    functionName: "list_user_address",
    args: [1],
  });

  const { isSuccess: isConfirmed, isError: isConfirmationError } =
    useWaitForTransactionReceipt({
      hash: txHash,
      confirmations: 1,
      query: { enabled: !!txHash, retry: 3, retryDelay: 1000 },
    });

  const { isSuccess: isUploadConfirmed } = useWaitForTransactionReceipt({
    hash: upload_txHash,
    confirmations: 1,
    query: { enabled: !!upload_txHash },
  });

  useEffect(() => {
    async function fetchNames() {
      const addresses = storeManagerAddresses as string[] | undefined;
      if (!addresses) return;
      const names = await Promise.all(
        addresses.map((addr: string) =>
          readContract(config, {
            ...wagmiContractConfig,
            functionName: "get_user_byAddress",
            args: [addr],
          })
        )
      );
      setStoreManagers(
        names.map((d: any) => ({
          address: d[0],
          name: d[1],
          location: d[2],
          successful_delivery: d[3],
        }))
      );
    }
    fetchNames();
  }, [storeManagerAddresses]);

  useEffect(() => {
    async function fetchNames() {
      const addresses = transporterAddresses as `0x${string}`[] | undefined;
      if (!addresses) return;
      const names = await Promise.all(
        addresses.map((addr: `0x${string}`) =>
          readContract(config, {
            ...wagmiContractConfig,
            functionName: "get_user_byAddress",
            args: [addr],
          })
        )
      );
      setTransporters(
        names.map((d: any) => ({
          address: d[0],
          name: d[1],
          location: d[2],
          successful_delivery: d[3],
        }))
      );
    }
    fetchNames();
  }, [transporterAddresses]);

  useEffect(() => {
    if (isUploadConfirmed) {
      set_upload_details([]);
      set_display_upload_form(false);
      alert("Crop uploaded successfully!");
    }
  }, [isUploadConfirmed]);

  const upload = useMutation({
    mutationFn: async (data: {
      name: string;
      product_id: string;
      quantity: number;
      price_per_unit: number;
      harvestDate: number;
    }) => {
      if (!isConnected) throw new Error("Wallet not connected");

      set_isSubmitting(true);

      try {
        const upload_hash = await writeContractAsync({
          ...wagmiContractConfig,
          functionName: "registerCrop",
          args: [
            data.name,
            data.product_id,
            BigInt(data.quantity),
            BigInt(data.price_per_unit),
            BigInt(data.harvestDate),
          ],
        });

        set_upload_txHash(upload_hash);
        return upload_hash;
      } catch (error) {
        set_isSubmitting(false);
        alert("Upload failed. Please try again.");
        throw error;
      }
    },
  });
  const deliver = useMutation({
    mutationFn: async (data: deliverDetails) => {
      if (!isConnected) throw new Error("Wallet not connected");

      set_isSubmitting(true);

      try {
        const hash = await writeContractAsync({
          ...wagmiContractConfig,
          functionName: "send_to_transporter",
          args: [
            BigInt(data.id),
            BigInt(data.quantity),
            data.store,
            data.transporter,
          ],
        });
        set_txHash(hash);
        set_isSubmitting(false);

        return hash;
      } catch (error) {
        set_isSubmitting(false);
        console.error("Delivery error:", error);
        alert(
          `Delivery failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        throw error;
      }
    },
  });

  useEffect(() => {
    async function get_products() {
      if (!isConnected) return;
      const count = Number(aval_products_count);
      const products = Array.from({ length: count }, (_, i) =>
        readContract(config, {
          ...wagmiContractConfig,
          functionName: "get_crop_byIndex",
          args: [BigInt(i + 1)],
        })
      );

      const all_products = await Promise.all(products);
      const values = all_products.filter(
        (p: any) => p[6]?.toLowerCase() === address?.toLowerCase()
      );
      const namePromises = values.map((p: any) =>
        readContract(config, {
          ...wagmiContractConfig,
          functionName: "get_user_name",
          args: [p[6]],
        })
      );
      const farmerName = await Promise.all(namePromises);

      const result: Crop[] = await Promise.all(
        values.map((item: any, i: number) => {
          let user_status;
          if (Number(item[7]) == 0) {
            user_status = "Pick_Up";
          } else if (Number(item[7]) == 1) {
            user_status = "In_Transit";
          } else if (Number(item[7]) == 2) {
            user_status = "Delivered";
          } else {
            user_status = "In_Farm";
          }
          const harvestTimestamp = Number(item[4]) * 1000;
          const harvestDate = new Date(harvestTimestamp).toLocaleDateString(
            "en-US",
            {
              day: "numeric",
              month: "short",
              year: "numeric",
            }
          );
          return {
            id: item[0],
            crop_id: item[1],
            name: item[2],
            quantity: item[3].toString(),
            harvestDate: harvestDate,
            price_per_unit: Number(item[5]),
            farmer: item[6],
            status: user_status,
            farmer_name: String(farmerName[i]),
          };
        })
      );
      set_available_products(result);
    }
    get_products();
  }, [
    address,
    isConnected,
    isUploadConfirmed,
    isConfirmed,
    aval_products_count,
  ]);

  //get farmer location
  useEffect(() => {
    async function fetchFarmerLocation() {
      if (!address) return;
      try {
        const user: any = await readContract(config, {
          ...wagmiContractConfig,
          functionName: "get_user_byAddress",
          args: [address],
        });
        setFarmerLocation(user[2]); // user[2] = location of farmer
      } catch (err) {
        console.error("Error fetching farmer location:", err);
      }
    }

    fetchFarmerLocation();
  }, [address]);

  useEffect(() => {
    if (isConfirmed) {
      const timer = setTimeout(() => {
        refetch();
        set_txHash(undefined);
        set_upload_txHash(undefined);
        set_isSubmitting(false);

        set_display_delivery_form(false);
        set_delivery_details([]);

        alert("Delivery sent successfully!");
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (isUploadConfirmed) {
      const timer = setTimeout(() => {
        refetch();
        set_txHash(undefined);
        set_upload_txHash(undefined);
        set_isSubmitting(false);

        set_upload_details([]);
        set_display_upload_form(false);

        alert("Crop uploaded successfully!");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, isUploadConfirmed, refetch]);
  function get_status_message() {
    if (isUploadConfirmed || isConfirmed)
      return "Transaction successful updating dashboard";
    if (isConfirmationError) return "Transaction failed. Try again.";
    if (deliver.isPending && !txHash) return "Preparing transaction...";
    if (txHash) return "Confirming transaction...";
  }

  function get_button_message() {
    return deliver.isPending || isSubmitting ? "Preparing..." : "Deliver";
  }

  function get_field_color(status: string) {
    if (status == "Pick_Up" || "In_Farm")
      return `px-4 py-3 text-sm bg-gray-200`;
    if (status == "In_Transit") return `px-4 py-3 text-sm bg-blue-200`;
    else return `px-4 py-3 text-sm bg-green-200`;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Farmer Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => {
              set_display_upload_form(true);
              set_display_delivery_form(false);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Upload a Crop
          </button>
          <Link
            to="/farmer/history"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            View History
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10 text-gray-600">
          <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mr-2" />
          Loading Data...
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Harvest Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {available_products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No crops uploaded.
                  </td>
                </tr>
              ) : (
                available_products.map((crop, id) => (
                  <tr
                    key={id}
                    className={id % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 text-sm">{crop.crop_id}</td>
                    <td className="px-4 py-3 text-sm">{crop.name}</td>
                    <td className="px-4 py-3 text-sm">{crop.quantity}</td>
                    <td className="px-4 py-3 text-sm">{crop.harvestDate}</td>
                    <td className="px-4 py-3 text-sm">{crop.farmer_name}</td>
                    <td className={`${get_field_color(crop.status)}`}>
                      {crop.status}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => {
                          set_display_delivery_form(true);
                          set_display_upload_form(false);
                          set_delivery_details([
                            {
                              ...delivery_details[0],
                              id: Number(crop.id),
                              pick_up_location:
                                farmerLocation || "Loading location...",
                            },
                          ]);
                        }}
                        className={`bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded ${
                          crop.status === "Delivered" ||
                          crop.status === "In_Transit" ||
                          crop.status === "Pick_Up"
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                        disabled={
                          crop.status === "Delivered" ||
                          crop.status === "In_Transit" ||
                          crop.status === "Pick_Up"
                        }
                      >
                        Send to Store
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {display_delivery_form && (
        <div className="mt-6 p-4 bg-white rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Delivery Details</h2>
          <form className="space-y-4">
            {/* Optional: Show pickup location (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Location (Auto-filled)
              </label>
              <input
                type="text"
                value={farmerLocation || "Loading..."}
                readOnly
                className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Optional: Show destination (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination (Auto-filled from store)
              </label>
              <input
                type="text"
                value={
                  delivery_details[0]?.destination || "Select a store first"
                }
                readOnly
                className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <input
              type="number"
              placeholder="Quantity"
              className="w-full border rounded p-2"
              onChange={(e) =>
                set_delivery_details([
                  {
                    ...delivery_details[0],
                    quantity: Number(e.target.value),
                  },
                ])
              }
              value={delivery_details[0]?.quantity || ""}
            />

            <select
              className="w-full border rounded p-2"
              onChange={(e) => {
                const selectedStore = storeManagers.find(
                  (s) => s.address === e.target.value
                );
                set_delivery_details([
                  {
                    ...delivery_details[0],
                    store: e.target.value as `0x${string}`,
                    destination: selectedStore?.location || "",
                  },
                ]);
              }}
            >
              <option value="">Select Store Manager</option>
              {storeManagers.map((s) => (
                <option key={s.address} value={s.address}>
                  {s.name}, based in {s.location}
                </option>
              ))}
            </select>

            <select
              className="w-full border rounded p-2"
              onChange={(e) =>
                set_delivery_details([
                  {
                    ...delivery_details[0],
                    transporter: e.target.value as `0x${string}`,
                  },
                ])
              }
            >
              <option value="">Select Transporter</option>
              {transporters.map((t) => (
                <option key={t.address} value={t.address}>
                  {t.name}, based in {t.location}
                </option>
              ))}
            </select>

            <p className="text-sm text-gray-600">{get_status_message()}</p>
            <button
              onClick={(e) => {
                e.preventDefault();

                if (!delivery_details[0]?.store) {
                  alert("Please select a store manager");
                  return;
                }
                if (!delivery_details[0]?.transporter) {
                  alert("Please select a transporter");
                  return;
                }
                if (
                  !delivery_details[0]?.quantity ||
                  delivery_details[0].quantity <= 0
                ) {
                  alert("Please enter a valid quantity");
                  return;
                }

                deliver.mutate(delivery_details[0]);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
              type="submit"
              disabled={
                isSubmitting ||
                deliver.isPending ||
                !delivery_details[0]?.store ||
                !delivery_details[0]?.transporter ||
                !delivery_details[0]?.quantity
              }
            >
              {get_button_message()}
            </button>
          </form>
        </div>
      )}

      {display_upload_form && (
        <div className="mt-6 p-4 bg-white rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Upload Crop</h2>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Name of product"
              className="w-full border rounded p-2"
              value={upload_details[0]?.name || ""}
              onChange={(e) =>
                set_upload_details([
                  { ...upload_details[0], name: e.target.value },
                ])
              }
            />
            <input
              type="date"
              placeholder="Harvest date"
              className="w-full border rounded p-2"
              value={upload_details[0]?.harvestDate || ""}
              onChange={(e) =>
                set_upload_details([
                  { ...upload_details[0], harvestDate: e.target.value },
                ])
              }
            />
            <input
              type="number"
              placeholder="Quantity"
              className="w-full border rounded p-2"
              value={upload_details[0]?.quantity || ""}
              onChange={(e) =>
                set_upload_details([
                  { ...upload_details[0], quantity: Number(e.target.value) },
                ])
              }
            />
            <input
              type="number"
              placeholder="Price per unit"
              className="w-full border rounded p-2"
              value={upload_details[0]?.price_per_unit || ""}
              onChange={(e) =>
                set_upload_details([
                  {
                    ...upload_details[0],
                    price_per_unit: Number(e.target.value),
                  },
                ])
              }
            />
            {upload_txHash && (
              <p className="text-green-600 break-words">{upload_txHash}</p>
            )}
            <p className="text-sm text-gray-600">{get_status_message()}</p>
            <button
              onClick={async (e) => {
                e.preventDefault();

                if (
                  !upload_details[0]?.name ||
                  !upload_details[0]?.quantity ||
                  !upload_details[0]?.harvestDate ||
                  !upload_details[0]?.price_per_unit
                ) {
                  alert("Please fill in all fields");
                  return;
                }

                try {
                  if (isConnected && address) {
                    const farmerName = await getUserName(address);
                    const product_id = `${farmerName.slice(
                      0,
                      2
                    )}${upload_details[0].name.slice(0, 2)}00${
                      available_products.length + 1
                    }`;

                    const harvestTimestamp =
                      new Date(upload_details[0].harvestDate).getTime() / 1000;

                    upload.mutate({
                      name: upload_details[0].name,
                      product_id: product_id,
                      quantity: upload_details[0].quantity,
                      price_per_unit: upload_details[0].price_per_unit,
                      harvestDate: harvestTimestamp,
                    });
                  } else {
                    alert("Connect wallet before uploading");
                  }
                } catch (error) {
                  console.error("Upload error:", error);
                  alert("Failed to upload crop");
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
              type="submit"
              disabled={isSubmitting || upload.isPending}
            >
              {isSubmitting || upload.isPending ? "Uploading..." : "Done"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Farmer_dashboard;
