export const wagmiContractConfig = {
  address: "0x1cc6Ebad310c23eEC78b8863FbD42e5049894EF3" as `0x${string}`,
  sourceName: "contracts/agric-tech.sol",
  abi: [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "all_users",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
      ],
      name: "approve_role",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_address",
          type: "address",
        },
      ],
      name: "check_application_result",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "cropId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "arrival_date",
          type: "uint256",
        },
      ],
      name: "confirmArrival",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "cropCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "crop_count",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "crops",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "crop_id",
          type: "string",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "quantity",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "price_per_unit",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "harvestDate",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "farmer",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "deliveryCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "farmer_history",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "farmer",
          type: "address",
        },
        {
          internalType: "string",
          name: "product_name",
          type: "string",
        },
        {
          internalType: "string",
          name: "sent_to",
          type: "string",
        },
        {
          internalType: "address",
          name: "store",
          type: "address",
        },
        {
          internalType: "string",
          name: "through",
          type: "string",
        },
        {
          internalType: "address",
          name: "transporter",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "date",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "farmers",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "get_all_users_count",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "cropId",
          type: "uint256",
        },
      ],
      name: "get_crop_byIndex",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "crop_id",
          type: "string",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "quantity",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "harvestDate",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "farmer",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "crop_id",
          type: "uint256",
        },
      ],
      name: "get_delivery_byIndex",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "cropId",
          type: "string",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "address",
          name: "farmer",
          type: "address",
        },
        {
          internalType: "address",
          name: "transporter",
          type: "address",
        },
        {
          internalType: "address",
          name: "store",
          type: "address",
        },
        {
          internalType: "string",
          name: "pick_up_location",
          type: "string",
        },
        {
          internalType: "string",
          name: "destination",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "quantity",
          type: "uint256",
        },
        {
          internalType: "enum FarmToStoreTraceability.Crop_Status",
          name: "status",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "get_delivery_count",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_farmer",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "get_farmer_history_byIndex",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "farmer",
          type: "address",
        },
        {
          internalType: "string",
          name: "product_name",
          type: "string",
        },
        {
          internalType: "string",
          name: "sent_to",
          type: "string",
        },
        {
          internalType: "address",
          name: "store",
          type: "address",
        },
        {
          internalType: "string",
          name: "through",
          type: "string",
        },
        {
          internalType: "address",
          name: "transporter",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "date",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_farmer",
          type: "address",
        },
      ],
      name: "get_farmer_history_count",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
      ],
      name: "get_pending_request_byIndex",
      outputs: [
        {
          internalType: "address",
          name: "pending_address",
          type: "address",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "string",
          name: "location",
          type: "string",
        },
        {
          internalType: "enum FarmToStoreTraceability.Role",
          name: "requestedRole",
          type: "uint8",
        },
        {
          internalType: "bool",
          name: "isApproved",
          type: "bool",
        },
        {
          internalType: "bool",
          name: "exists",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "get_pending_request_count",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "product_id",
          type: "uint256",
        },
      ],
      name: "get_product_byIndex",
      outputs: [
        {
          internalType: "string",
          name: "crop_id",
          type: "string",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "address",
          name: "owner_address",
          type: "address",
        },
        {
          internalType: "address",
          name: "transporter_address",
          type: "address",
        },
        {
          internalType: "address",
          name: "store_address",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "harvestDate",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "quantity",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "price_per_unit",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "arrival_date",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_store",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "get_store_history_byIndex",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "farmer",
          type: "address",
        },
        {
          internalType: "address",
          name: "transporter",
          type: "address",
        },
        {
          internalType: "string",
          name: "farmer_name",
          type: "string",
        },
        {
          internalType: "string",
          name: "transporter_name",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "date",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "product_name",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "quantity",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_store",
          type: "address",
        },
      ],
      name: "get_store_history_count",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "get_store_product_count",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_transporter",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "get_transporter_history_byIndex",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "farmer",
          type: "address",
        },
        {
          internalType: "address",
          name: "store",
          type: "address",
        },
        {
          internalType: "string",
          name: "farmer_name",
          type: "string",
        },
        {
          internalType: "string",
          name: "store_name",
          type: "string",
        },
        {
          internalType: "string",
          name: "crop_name",
          type: "string",
        },
        {
          internalType: "string",
          name: "from",
          type: "string",
        },
        {
          internalType: "string",
          name: "to",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "date",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_transporter",
          type: "address",
        },
      ],
      name: "get_transporter_history_count",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_address",
          type: "address",
        },
      ],
      name: "get_user_byAddress",
      outputs: [
        {
          internalType: "address",
          name: "user_address",
          type: "address",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "string",
          name: "location",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "successful_delivery",
          type: "uint256",
        },
        {
          internalType: "enum FarmToStoreTraceability.Role",
          name: "role",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "get_user_byIndex",
      outputs: [
        {
          internalType: "address",
          name: "user_address",
          type: "address",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "string",
          name: "location",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "successful_delivery",
          type: "uint256",
        },
        {
          internalType: "enum FarmToStoreTraceability.Role",
          name: "role",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "get_user_count",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_address",
          type: "address",
        },
      ],
      name: "get_user_details",
      outputs: [
        {
          internalType: "address",
          name: "user_address",
          type: "address",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "string",
          name: "location",
          type: "string",
        },
        {
          internalType: "enum FarmToStoreTraceability.Role",
          name: "role",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_address",
          type: "address",
        },
      ],
      name: "get_user_name",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "enum FarmToStoreTraceability.Role",
          name: "role",
          type: "uint8",
        },
      ],
      name: "list_user_address",
      outputs: [
        {
          internalType: "address[]",
          name: "",
          type: "address[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "pendingDeliveries",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "cropId",
          type: "string",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "address",
          name: "farmer",
          type: "address",
        },
        {
          internalType: "address",
          name: "transporter",
          type: "address",
        },
        {
          internalType: "address",
          name: "store",
          type: "address",
        },
        {
          internalType: "string",
          name: "pick_up_location",
          type: "string",
        },
        {
          internalType: "string",
          name: "destination",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "quantity",
          type: "uint256",
        },
        {
          internalType: "enum FarmToStoreTraceability.Crop_Status",
          name: "status",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "pendingUsers",
      outputs: [
        {
          internalType: "address",
          name: "pending_address",
          type: "address",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "string",
          name: "location",
          type: "string",
        },
        {
          internalType: "enum FarmToStoreTraceability.Role",
          name: "requestedRole",
          type: "uint8",
        },
        {
          internalType: "bool",
          name: "isApproved",
          type: "bool",
        },
        {
          internalType: "bool",
          name: "exists",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "pending_users_count",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "product_inStore",
      outputs: [
        {
          internalType: "string",
          name: "crop_id",
          type: "string",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "address",
          name: "owner_address",
          type: "address",
        },
        {
          internalType: "address",
          name: "transporter_address",
          type: "address",
        },
        {
          internalType: "address",
          name: "store_address",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "harvestDate",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "quantity",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "price_per_unit",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "arrival_date",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
      ],
      name: "product_inTransit",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "string",
          name: "product_id",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "quantity",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_price",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "harvestDate",
          type: "uint256",
        },
      ],
      name: "registerCrop",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
      ],
      name: "reject_role",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "rejected_roles",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "enum FarmToStoreTraceability.Role",
          name: "role",
          type: "uint8",
        },
        {
          internalType: "string",
          name: "_location",
          type: "string",
        },
      ],
      name: "request_for_role",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_address",
          type: "address",
        },
      ],
      name: "resign_user",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "roles",
      outputs: [
        {
          internalType: "enum FarmToStoreTraceability.Role",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_quantity",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "_store",
          type: "address",
        },
        {
          internalType: "address",
          name: "transporter",
          type: "address",
        },
        {
          internalType: "string",
          name: "_pick_up_location",
          type: "string",
        },
        {
          internalType: "string",
          name: "_destination",
          type: "string",
        },
      ],
      name: "send_to_transporter",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "store_history",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "farmer",
          type: "address",
        },
        {
          internalType: "address",
          name: "transporter",
          type: "address",
        },
        {
          internalType: "string",
          name: "farmer_name",
          type: "string",
        },
        {
          internalType: "string",
          name: "transporter_name",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "date",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "product_name",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "quantity",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "store_managers",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "store_product_count",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "transporter_history",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "farmer",
          type: "address",
        },
        {
          internalType: "address",
          name: "store",
          type: "address",
        },
        {
          internalType: "string",
          name: "farmer_name",
          type: "string",
        },
        {
          internalType: "string",
          name: "store_name",
          type: "string",
        },
        {
          internalType: "string",
          name: "crop_name",
          type: "string",
        },
        {
          internalType: "string",
          name: "from",
          type: "string",
        },
        {
          internalType: "string",
          name: "to",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "date",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "transporters",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "user_count",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "users",
      outputs: [
        {
          internalType: "address",
          name: "user_address",
          type: "address",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "string",
          name: "location",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "successful_delivery",
          type: "uint256",
        },
        {
          internalType: "enum FarmToStoreTraceability.Role",
          name: "role",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "connected_address",
          type: "address",
        },
      ],
      name: "wallet_identity",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
};
