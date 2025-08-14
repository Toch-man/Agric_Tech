import { useState } from "react";

type Crop = {
  id: string;
  name: string;
  quantity: string;
  harvestDate: string;
  farmer: `0x${string}`;
  retailer: string;
  delivered: boolean;
};
const Farmer_dashboard = () => {
  const [crops, set_crop] = useState<Crop[] | []>([]);
  return (
    <div>
      <h1>Dashboard</h1>
      <button>upload a crop</button>
      <section>
        <table>
          <thead>
            <tr className=" bg-white w-full py-3 text-black text-[20px] font-bold">
              <td className="w-fit-content h-[5px] bg-gray-400 p-5">ID</td>
              <td>name</td>
              <td>quantity</td>
              <td>harvestDate</td>
              <td>delivered</td>
            </tr>
          </thead>
          <tbody>
            {crops.map((crop, id) => (
              <tr>
                <td key={id}>{crop.id}</td>
                <td key={id}>{crop.name}</td>
                <td key={id}>{crop.quantity}</td>
                <td key={id}>{crop.harvestDate}</td>
                <td key={id}>{crop.farmer}</td>
                <td key={id}>{crop.retailer}</td>
                <td key={id}>{crop.delivered}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
