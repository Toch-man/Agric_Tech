import { useAccount } from "wagmi";
import Header from "../../layouts/header";
import { useNavigate } from "react-router-dom";

export default function Admin_dashboard() {
  const { address } = useAccount();
  const navigate = useNavigate();

  return (
    <Header>
      <div className="bg-[url('/images/background.jpg')] bg-cover bg-center min-h-screen w-full">
        <div className="flex flex-col md:flex-row justify-center items-center text-center md:text-left h-full px-4 py-10 gap-6">
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
            Admin Dashboard
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 md:ml-10">
            <button
              className={`w-[200px] h-[50px] bg-green-500 text-white font-semibold border-2 border-black rounded-lg shadow-md transition-all duration-300 hover:bg-green-600 hover:scale-105 ${
                !address && "cursor-not-allowed opacity-50 hover:scale-100"
              }`}
              onClick={() => navigate("/approve")}
              disabled={!address}
            >
              View Pending Roles
            </button>
            <button
              className={`w-[200px] h-[50px] bg-green-500 text-white font-semibold border-2 border-black rounded-lg shadow-md transition-all duration-300 hover:bg-green-600 hover:scale-105 ${
                !address && "cursor-not-allowed opacity-50 hover:scale-100"
              }`}
              onClick={() => navigate("/list_users")}
              disabled={!address}
            >
              View users
            </button>

            <button
              className={`w-[200px] h-[50px] bg-green-500 text-white font-semibold border-2 border-black rounded-lg shadow-md transition-all duration-300 hover:bg-green-600 hover:scale-105 ${
                !address && "cursor-not-allowed opacity-50 hover:scale-100"
              }`}
              onClick={() => navigate("/activities")}
              disabled={!address}
            >
              View User&apos;s Activity
            </button>
          </div>
        </div>
      </div>
    </Header>
  );
}
