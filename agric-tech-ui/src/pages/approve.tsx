import { useState } from "react";
type request = {
  id: string;
  address: `0x${string}`;
  role: string;
  exists: boolean;
};
const Approve = () => {
  const [request, set_request] = useState<request[] | []>([]);
  return (
    <div>
      <h1>Pending Requests</h1>
      <section>
        <table>
          <thead>
            <tr className=" bg-white w-full py-3 text-black text-[20px] font-bold">
              <td className="w-fit-content h-[5px] bg-gray-400 p-5">ID</td>
              <td className="w-fit-content h-[5px] bg-gray-400 p-5">
                user_address
              </td>
              <td className="w-fit-content h-[5px] bg-gray-400 p-5">
                requested_role
              </td>
              <td className="w-fit-content h-[5px] bg-gray-400 p-5">action</td>
            </tr>
          </thead>
          <tbody>
            {request.map((request, id) => (
              <tr
                className={`${id % 2 == 0 ? "bg-gray-400" : "bg-white"} w-full h-[20px] py-3 px-10 text-black text-[15px]`}
              >
                <td key={id}>{request.id}</td>
                <td key={id}>{request.address}</td>
                <td key={id}>{request.role}</td>
                <td key={id}>
                  <button>Approve request</button>
                  <button>Reject request</button>
                </td>
              </tr>
            ))}{" "}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Approve;
