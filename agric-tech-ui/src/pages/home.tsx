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
          <button
            className={`w-[150px] h-[50px] bg-green-500 border-2 m-10 border-black rounded  ${!address && "cursor-not-allowed opacity-50"}`}
            onClick={() => navigate("/register")}
            disabled={address ? false : true}
          >
            Register farm
          </button>
          <button
            className={`w-fit-content h-[50px] bg-green-500 border-2 p-3 border-black rounded ${!address && "cursor-not-allowed opacity-50"}`}
            disabled={address ? false : true}
            onClick={() => navigate("/productList")}
          >
            Purchase farm products
          </button>
        </div>
      </div>
    </Header>
  );
}
