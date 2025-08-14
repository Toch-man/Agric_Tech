import { useAccount } from "wagmi";
import Header from "../layout/header";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const { address } = useAccount();
  const navigate = useNavigate();

  return (
    <Header>
      <div className="bg-[url('/images/background.jpg')]  bg-cover bg-center  h-screen w-full">
        <div className="flex flex-row justify-center items-center h-full">
          <h1>Welcome Admin </h1>
          <button
            className={`w-[150px] h-[50px] bg-green-500 border-2 m-10 border-black rounded  ${!address && "cursor-not-allowed opacity-50"}`}
            onClick={() => navigate("/approve")}
            disabled={address ? false : true}
          >
            Approve Roles
          </button>
          <button
            className={`w-fit-content h-[50px] bg-green-500 border-2 p-3 border-black rounded ${!address && "cursor-not-allowed opacity-50"}`}
            disabled={address ? false : true}
            onClick={() => navigate("/productList")}
          >
            view crops cycle
          </button>

          <h1>welcome to ......</h1>
          <button onClick={() => navigate("/farmerDashboard")}>Farmer</button>
          <button onClick={() => navigate("/transporterDashboard")}>
            Transporter
          </button>
          <button onClick={() => navigate("/storeManager")}>
            Store-Manager
          </button>
        </div>
      </div>
    </Header>
  );
}
