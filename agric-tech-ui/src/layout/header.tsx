import { useAccount, useDisconnect, useReadContract } from "wagmi";
import { wagmiContractConfig } from "../contracts/contract";
import WalletOptions from "../wallet-option";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Header({ children }: { children?: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  //   const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [displayWalletList, setDisplayWalletList] = useState(false);
  const [displayMenu, setDisplayMenu] = useState(false);
  const navigate = useNavigate();

  const { data: check_user_identity, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "wallet_identity", // this must exist in your contract
    args: address ? [address] : [],
    query: { enabled: !!address },
  });

  useEffect(() => {
    if (!isConnected || !address || check_user_identity === undefined) {
      navigate("/homePage");
      return;
    }

    if (isConnected && check_user_identity === "farmer") {
      navigate("/farmer_dashboard");
    } else if (check_user_identity === "transporter") {
      navigate("/transporter_dashboard");
    } else if (check_user_identity === "storeManager") {
      navigate("/store_dashboard");
    } else if (check_user_identity === "admin") {
      navigate("/admin_dashboard");
    } else navigate("/apply_for_role");
  }, [isConnected, address, isLoading, check_user_identity]);

  const navBar = (
    <div
      className={`${displayMenu ? "block absolute left-0 top-0 bottom-0 pt-[65px] w-[300px] bg-black text-white z-50" : "hidden"}`}
    >
      <ul>
        <li className="flex flex-row p-5 hover:bg-green-500">
          <img></img>
          <p>Home</p>
        </li>
        <li className="flex flex-row p-5 hover:bg-green-500">
          <img></img>
          <p>About us</p>
        </li>
        <li className="flex flex-row p-5 hover:bg-green-500">
          <img></img>
          <p>Help</p>
        </li>
        <li
          onClick={() => {
            navigate("/apply_for_role");
          }}
          className="flex flex-row p-5 hover:bg-green-500"
        >
          <img></img>
          <p>Apply for a role</p>
        </li>
        <li
          onClick={() => {
            disconnect();
          }}
          className="flex flex-row p-5 hover:bg-green-500"
        >
          <img></img>
          <p>Disconnect wallet</p>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="relative">
      <div className=" flex flex-row justify-between items-center h-[100px] py-10 px-4">
        <img
          src={`${displayMenu ? "Frame.png" : "menu.png"}`}
          onClick={() => setDisplayMenu(!displayMenu)}
          className={` w-[26px] h-[26px]  z-100 ${displayMenu && "invert absolute top-10 left-[250px]"}`}
          alt="menu"
        ></img>
        <div className="flex flex-1 justify-end items-center pr-5">
          <p>{`${isLoading ? "checking wallet" : ""}`}</p>
          <button
            className="flex items-center justify-center w-[150px] h-[50px] bg-green-500"
            onClick={() => setDisplayWalletList(true)}
          >
            {isConnected
              ? address && `${address.slice(0, 2)}... ${address.slice(-3)}`
              : "Connect wallet"}
          </button>
        </div>
      </div>{" "}
      {!isConnected && (
        <div
          className={`${displayWalletList ? "flex flex-col absolute rounded border-black shadow-2xl py-5 left-1/3 top-1/3 z-100 bg-white w-[490px] h-[200px] " : "hidden"}`}
        >
          <h1 className="text-[25px]  text-blue-600 font-bold text-center">
            Installed wallets
          </h1>

          <div className="flex flex-row">
            {" "}
            <WalletOptions />
          </div>
        </div>
      )}
      {navBar}
      <div className="z-50">{children}</div>
    </div>
  );
}

export default Header;
