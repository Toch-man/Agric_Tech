import { useState } from "react";

type delivery = {
  id: string;
  name: string;
  farmer: `0x${string}`;
  pick_up_location: string;
  destination: string;
  status: string;
};

const Transporter_dashboard = () => {
  const [deliveries, set_deliveries] = useState<delivery[] | []>([]);
  return (
    <div>
      <h1>Available deliveries</h1>
      <section>
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
              <td className="w-fit-content h-[5px] bg-gray-400 p-5">Action</td>
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
                <td key={id}></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Transporter_dashboard;
