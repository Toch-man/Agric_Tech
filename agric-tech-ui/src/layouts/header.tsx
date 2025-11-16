import { useAccount, useDisconnect, useReadContract } from "wagmi";
import { wagmiContractConfig } from "../contracts/contract";
import WalletOptions from "../wallet-option";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiUserPlus } from "react-icons/fi";
import { BsQrCodeScan } from "react-icons/bs";
import { BiLogOut } from "react-icons/bi";
import { AiOutlineHome } from "react-icons/ai";
import { MdOutlineHelp, MdDashboard } from "react-icons/md";

function Header({ children }: { children?: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [displayWalletList, setDisplayWalletList] = useState(false);
  const [displayMenu, setDisplayMenu] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState({
    title: "Wallet Required",
    message: "Please connect your wallet to access this feature.",
  });

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
      if (
        location.pathname !== "/homePage" &&
        location.pathname !== "/scan_product"
      ) {
        navigate("/homePage", { replace: true });
      }

      return;
    }

    if (check_user_identity === undefined) return;

    const userIdentity = check_user_identity as string;
    const routeMap: Record<string, string> = {
      farmer: "/farmer/dashboard",
      transporter: "/transporter/dashboard",
      storeManager: "/store/dashboard",
      admin: "/admin_dashboard",
      none: "/scan_product",
    };

    const targetRoute = routeMap[userIdentity];
    if (
      !location.pathname.startsWith(targetRoute) &&
      location.pathname !== "/apply_for_role" &&
      location.pathname !== "/scan_product" &&
      location.pathname !== "/approve" &&
      location.pathname !== "/list_users" &&
      location.pathname !== "/activities"
    ) {
      navigate(targetRoute, { replace: true });
    }
  }, [isConnected, address, check_user_identity, isLoading]);

  const handleRestricted = (callback: () => void, restricted: boolean) => {
    if (restricted && (!isConnected || !address)) {
      setDialogMessage({
        title: "Wallet Required",
        message: "Please connect your wallet to access this feature.",
      });
      setShowDialog(true);
      return;
    }
    callback();
  };

  const handleDashboardClick = () => {
    if (!isConnected || !address) {
      setDialogMessage({
        title: "Wallet Required",
        message: "Please connect your wallet to access your dashboard.",
      });
      setShowDialog(true);
      return;
    }

    const userIdentity = check_user_identity as string;
    const dashboardRoutes: Record<string, string> = {
      farmer: "/farmer/dashboard",
      transporter: "/transporter/dashboard",
      storeManager: "/store/dashboard",
      admin: "/admin_dashboard",
    };

    const targetRoute = dashboardRoutes[userIdentity];

    if (targetRoute) {
      navigate(targetRoute);
      setDisplayMenu(false);
    } else {
      setDialogMessage({
        title: "No Dashboard Available",
        message:
          "You don't have a dashboard. You can scan products to view their supply chain history.",
      });
      setShowDialog(true);
    }
  };

  const navBar = (
    <div
      className={`${
        displayMenu
          ? "absolute top-0 left-0 w-[300px] min-h-screen bg-black text-white transition-transform duration-300 translate-x-0"
          : "absolute top-0 left-0 w-[300px] min-h-screen bg-black text-white transition-transform duration-300 -translate-x-full"
      }`}
    >
      {/* Frame image at the top-right of sidebar */}
      <img
        src="/Frame.png"
        alt="frame"
        className="absolute invert top-8 right-4 w-[26px] h-auto"
        onClick={() => setDisplayMenu(false)}
      />

      <ul className="pt-[100px]">
        <li
          onClick={() => {
            navigate("/homePage");
            setDisplayMenu(false);
          }}
          className="flex flex-row p-5 gap-3 hover:bg-green-500 cursor-pointer"
        >
          <AiOutlineHome size={24} />
          <p className="text-[16px]">Home</p>
        </li>

        {/* Dashboard link */}
        <li
          onClick={handleDashboardClick}
          className="flex flex-row p-5 gap-3 hover:bg-green-500 cursor-pointer"
        >
          <MdDashboard size={24} />
          <p className="text-[16px]">Dashboard</p>
        </li>

        <li
          onClick={() => {
            navigate("/how_to_use");
            setDisplayMenu(false);
          }}
          className="flex flex-row p-5 gap-3 hover:bg-green-500 cursor-pointer"
        >
          <MdOutlineHelp size={24} />
          <p className="text-[16px]">How To Use</p>
        </li>

        <li
          onClick={() =>
            handleRestricted(() => {
              navigate("/apply_for_role");
              setDisplayMenu(false);
            }, true)
          }
          className="flex flex-row p-5 gap-3 hover:bg-green-500 cursor-pointer"
        >
          <FiUserPlus size={24} />
          <p className="text-[16px]">Apply for a role</p>
        </li>

        <li
          onClick={() =>
            handleRestricted(() => {
              navigate("/scan_product");
              setDisplayMenu(false);
            }, false)
          }
          className="flex flex-row p-5 gap-3 hover:bg-green-500 cursor-pointer"
        >
          <BsQrCodeScan size={24} />
          <p className="text-[16px]">Scan product</p>
        </li>

        <li
          onClick={() => {
            if (isConnected && address) {
              disconnect();
              setDisplayMenu(false);
            }
          }}
          className="flex flex-row p-5 gap-3 hover:bg-green-500 cursor-pointer"
        >
          <BiLogOut size={24} />
          <p className="text-[16px]">Disconnect wallet</p>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="relative">
      {navBar}

      {/* Header */}
      <div className="flex flex-row justify-between items-center h-[100px] py-10 px-4 z-[10000] bg-white shadow-md">
        {/* Menu Toggle Icon */}
        <img
          src="/menu.png"
          onClick={() => setDisplayMenu(!displayMenu)}
          className={`w-[26px] h-[26px] cursor-pointer ${
            displayMenu && "hidden"
          }`}
          alt="menu toggle"
        />

        {/* Wallet Button */}
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

      {/* Wallet Options */}
      {!isConnected && displayWalletList && (
        <div className="flex flex-col fixed rounded border border-gray-300 shadow-2xl py-5 left-1/2 transform -translate-x-1/2 top-1/3 z-[10001] bg-white w-[490px] min-h-[200px]">
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

      {/* Dialog Box */}
      {showDialog && (
        <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 bg-white rounded-xl p-6 w-[90%] sm:w-[400px] text-center shadow-2xl border border-gray-300 z-[10002]">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            {dialogMessage.title}
          </h2>
          <p className="text-gray-600 mb-6">{dialogMessage.message}</p>
          <button
            onClick={() => setShowDialog(false)}
            className="px-5 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            OK
          </button>
        </div>
      )}

      <div className="z-[1]">{children}</div>
    </div>
  );
}

export default Header;
