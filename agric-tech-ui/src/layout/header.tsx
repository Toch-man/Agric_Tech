import { useAccount, useDisconnect, useReadContract } from "wagmi";
import { wagmiContractConfig } from "../contracts/contract";
import WalletOptions from "../wallet-option";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

function Header({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  //   const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [displayWalletList, setDisplayWalletList] = useState(false);
  const [displayMenu, setDisplayMenu] = useState(false);
  const navigate = useNavigate();

  const { data: isRegistered, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "isRegistered", // this must exist in your contract
    args: address ? [address] : [],
    query: { enabled: !!address },
  });

  useEffect(() => {
    if (!isConnected || !address || isRegistered === undefined) {
      return;
    }

    const currentPath = location.pathname;
    if (isRegistered) {
      navigate("/dashBoard");
    } else if (!isRegistered && currentPath !== "/register") {
      navigate("/register");
    }
  }, [isConnected, address, isLoading, location.pathname, isRegistered]);

  const navBar = (
    <div
      className={`${displayMenu ? "block absolute left-0 top-0 bottom-0 w-[300px] bg-black text-white z-50" : "hidden"}`}
    >
      <ul>
        <li className="flex flex-row hover:bg-green-500">
          <img></img>
          <p>Home</p>
        </li>
        <li className="flex flex-row hover:bg-green-500">
          <img></img>
          <p>About us</p>
        </li>
        <li className="flex flex-row hover:bg-green-500">
          <img></img>
          <p>Help</p>
        </li>
        <li
          onClick={() => {
            disconnect();
            navigate("/homePage");
          }}
          className="flex flex-row hover:bg-green-500"
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
          className={`w-[26px] h-[26px] z-100 ${displayMenu && "invert"}`}
          alt="menu"
        ></img>
        <div className="flex flex-1 justify-end items-center pr-5">
          <p>{`${isLoading ? "checking wallet" : ""}`}</p>
          <button
            className="flex items-center justify-center w-[150px] h-[50px] bg-green-300"
            onClick={() => setDisplayWalletList(true)}
          >
            {isConnected
              ? address && `${address.slice(0, 2)}... ${address.slice(-3)}`
              : "Connect wallet"}
          </button>
        </div>
      </div>
      <div className="absolute inset-x-0 flex justify-center">
        {" "}
        <div
          className={`${displayWalletList ? "flex flex-row bg-black w-[400px] h-[200px] mx-auto" : "hidden"}`}
        >
          {!isConnected && <WalletOptions />}
        </div>
      </div>

      {navBar}
      {children}
    </div>
  );
}

export default Header;
