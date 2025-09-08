import { useEffect, useState } from "react";

type delivery = {
  id: string;
  name: string;
  farmer: `0x${string}`;
  transporter: `0x${string}`;
  store: `0x${string}`;
  pick_up_location: string;
  destination: string;
  quantity: number;
  status: string;
};

const Activity = () => {
  const [deliveries, set_deliveries] = useState<delivery[] | []>([]);
  return (
    <div>
      <div className="flex flex-row">
        {" "}
        <h1>Farm to store Chain</h1>
        <div>
          {" "}
          <input
            type="text"
            placeholder="Search"
            className="border hidden md:block border-gray-300 rounded-full py-2 px-4 w-64 focus:outline-none"
          />
          <span className="absolute right-3 md:right-4 md:top-2.5 top-[-8px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="md:h-5 md:w-5 w-6 h-6 md:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>
      </div>
      <table>
        <thead>
          <tr className=" bg-white w-full py-3 text-black text-[20px] font-bold">
            <td className="w-fit-content h-[5px] bg-gray-400 p-5">ID</td>
            <td className="w-fit-content h-[5px] bg-gray-400 p-5">
              Product Name
            </td>
            <td className="w-fit-content h-[5px] bg-gray-400 p-5">
              farmer_address
            </td>
            <td className="w-fit-content h-[5px] bg-gray-400 p-5">
              Pick up location
            </td>
            <td className="w-fit-content h-[5px] bg-gray-400 p-5">
              Destination
            </td>
            <td className="w-fit-content h-[5px] bg-gray-400 p-5">Store</td>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((delivery, id) => (
            <tr>
              <td key={id}>{delivery.id}</td>
              <td key={id}>{delivery.name}</td>
              <td key={id}>{delivery.farmer}</td>
              <td key={id}>{delivery.pick_up_location}</td>
              <td key={id}>{delivery.destination}</td>
              <td key={id}>{delivery.store}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Activity;
