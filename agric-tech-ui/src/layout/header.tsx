import { useAccount, useDisconnect, useReadContract } from "wagmi";
import { wagmiContractConfig } from "../contracts/contract";
import WalletOptions from "../wallet-option";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

function Header({ children }: { children?: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [displayWalletList, setDisplayWalletList] = useState(false);
  const [displayMenu, setDisplayMenu] = useState(false);

  const [hoverMessage, setHoverMessage] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const location = useLocation();

  const { data: check_user_identity, isLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "wallet_identity",
    args: [address],
    query: { enabled: !!address },
  });

  useEffect(() => {
    if (isLoading) return;

    if (!isConnected || !address) {
      if (location.pathname !== "/homePage") {
        console.log("Contract returned identity:", check_user_identity);
        navigate("/homePage", { replace: true });
      }
      return;
    }

    if (check_user_identity === undefined) {
      console.log(check_user_identity);
      return;
    }

    const userIdentity = check_user_identity as string;
    const routeMap: Record<string, string> = {
      farmer: "/farmer_dashboard",
      transporter: "/transporter_dashboard",
      storeManager: "/store_dashboard",
      admin: "/admin_dashboard",
      none: "/scan_product",
    };

    const targetRoute = routeMap[userIdentity];
    if (
      location.pathname !== targetRoute &&
      location.pathname !== "/apply_for_role" &&
      location.pathname !== "/scan_product"
    ) {
      navigate(targetRoute, { replace: true });
    }
  }, [isConnected, address, check_user_identity, isLoading]);

  // Show tooltip near mouse
  const handleHover = (e: React.MouseEvent, message: string) => {
    if (!isConnected || !address) {
      setTooltipPos({ x: e.clientX + 15, y: e.clientY - 10 });
      setHoverMessage(message);

      // Auto-hide tooltip after 2 seconds
      setTimeout(() => {
        setHoverMessage(null);
      }, 2000);
    }
  };

  const navBar = (
    <div
      className={`${
        displayMenu
          ? "block absolute left-0 top-0 bottom-0 pt-[65px] w-[300px] bg-black text-white z-50"
          : "hidden"
      }`}
    >
      <ul>
        <li className="flex flex-row p-5 hover:bg-green-500 cursor-pointer">
          <img alt="home icon" />
          <p>Home</p>
        </li>
        <li className="flex flex-row p-5 hover:bg-green-500 cursor-pointer">
          <img alt="about icon" />
          <p>About us</p>
        </li>
        <li className="flex flex-row p-5 hover:bg-green-500 cursor-pointer">
          <img alt="help icon" />
          <p>Help</p>
        </li>
        <li
          onClick={() => {
            if (isConnected && address) {
              navigate("/apply_for_role");
              setDisplayMenu(false);
            }
          }}
          onMouseEnter={(e) =>
            handleHover(e, "Please connect wallet to access this feature")
          }
          className="flex flex-row p-5 hover:bg-green-500 cursor-pointer"
        >
          <img alt="role icon" />
          <p>Apply for a role</p>
        </li>
        <li
          onClick={() => {
            setDisplayMenu(false);

            navigate("/scan_product");
          }}
          className="flex flex-row p-5 hover:bg-green-500 cursor-pointer"
        >
          <img alt="role icon" />
          <p>Scan product</p>
        </li>
        <li
          onClick={() => {
            if (isConnected && address) {
              disconnect();
              setDisplayMenu(false);
            }
          }}
          onMouseEnter={(e) =>
            handleHover(e, "Please connect wallet to access this feature")
          }
          className="flex flex-row p-5 hover:bg-green-500 cursor-pointer"
        >
          <img alt="disconnect icon" />
          <p>Disconnect wallet</p>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="relative">
      <div className="flex flex-row justify-between items-center h-[100px] py-10 px-4">
        <img
          src={displayMenu ? "Frame.png" : "menu.png"}
          onClick={() => setDisplayMenu(!displayMenu)}
          className={`w-[26px] h-[26px] cursor-pointer z-100 ${
            displayMenu && "invert absolute top-10 left-[250px]"
          }`}
          alt="menu"
        />
        <div className="flex flex-1 justify-end items-center pr-5">
          {isLoading && (
            <p className="mr-3 text-sm text-gray-600">Checking wallet...</p>
          )}
          <button
            className="flex items-center justify-center w-[150px] h-[50px] bg-green-500 rounded hover:bg-green-600 transition-colors text-white font-medium"
            onClick={() => setDisplayWalletList(true)}
          >
            {isConnected && address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : "Connect wallet"}
          </button>
        </div>
      </div>

      {!isConnected && displayWalletList && (
        <div className="flex flex-col absolute rounded border border-gray-300 shadow-2xl py-5 left-1/2 transform -translate-x-1/2 top-1/3 z-50 bg-white w-[490px] min-h-[200px]">
          <button
            onClick={() => setDisplayWalletList(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
          <h1 className="text-[25px] text-blue-600 font-bold text-center mb-4">
            Installed wallets
          </h1>
          <div className="flex flex-row justify-center">
            <WalletOptions />
          </div>
        </div>
      )}

      {navBar}

      {/* Tooltip box */}
      {hoverMessage && (
        <div
          className="absolute bg-white text-black text-xs px-3 py-1 rounded shadow-lg"
          style={{
            top: tooltipPos.y,
            left: tooltipPos.x,
            pointerEvents: "none", // don't block mouse events
          }}
        >
          {hoverMessage}
        </div>
      )}

      <div className="z-10">{children}</div>
    </div>
  );
}

export default Header;
