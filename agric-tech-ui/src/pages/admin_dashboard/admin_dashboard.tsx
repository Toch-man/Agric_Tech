import { useAccount } from "wagmi";
import Header from "../../layout/header";
import { useNavigate } from "react-router-dom";

export default function Admin_dashboard() {
  const { address } = useAccount();
  const navigate = useNavigate();

  // this page depending on if the acct connected is from the admin ,a farme rtc
  return (
    <Header>
      <div className="bg-[url('/images/background.jpg')]  bg-cover bg-center  h-screen w-full">
        <div className="flex flex-row justify-center items-center h-full">
          <h1>Admin Dashsboard </h1>
          <button
            className={`w-[150px] h-[50px] bg-green-500 border-2 m-10 border-black rounded  ${!address && "cursor-not-allowed opacity-50"}`}
            onClick={() => navigate("/approve")}
            disabled={address ? false : true}
          >
            View pending Roles
          </button>
          <button
            className={`w-[150px] h-[50px] bg-green-500 border-2 m-10 border-black rounded  ${!address && "cursor-not-allowed opacity-50"}`}
            onClick={() => navigate("/activities")}
            disabled={address ? false : true}
          >
            View User's Activity
          </button>
        </div>
      </div>
    </Header>
  );
}
