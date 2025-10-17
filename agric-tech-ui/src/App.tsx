import Admin_dashboard from "./pages/admin_dashboard/admin_dashboard";
import HomePage from "./pages/home";
import RegisterFarm from "./pages/register";
import Dashboard from "./pages/dashBoard";
import Approve from "./pages/registration/approve";
import RequestRole from "./pages/registration/apply_for_role";
import Farmer_dashboard from "./dashboard/farmer/farmer";
import Farmer_history from "./dashboard/farmer/farmer_history";
import Transporter_dashboard from "./dashboard/transporter/transporter";
import Transporter_history from "./dashboard/transporter/transporter_history";
import Store_dashboard from "./dashboard/store/store";
import Store_history from "./dashboard/store/store_history";
import Product_in_store from "./dashboard/store/product_in_store";
import Store_deliveries from "./dashboard/store/store_delivery";
import Activity from "./pages/admin_dashboard/activity";
import Scan_products from "./pages/consumer/scan_product";
import List_user from "./pages/admin_dashboard/view_users";
import { useEffect } from "react";
import { useDisconnect } from "wagmi";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

export default function App() {
  const { disconnect } = useDisconnect();
  useEffect(() => {
    // disconnect wallet once on first load
    disconnect();
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/homePage" element={<HomePage />} />
        <Route path="/store_dashboard" element={<Store_dashboard />} />
        <Route path="/admin_dashboard" element={<Admin_dashboard />} />
        <Route path="*" element={<Navigate to="/homePage" replace />} />
        <Route path="/register" element={<RegisterFarm />} />
        <Route path="/dashBoard" element={<Dashboard />} />
        <Route path="/approve" element={<Approve />} />
        <Route path="/apply_for_role" element={<RequestRole />} />
        <Route path="/farmer_dashboard" element={<Farmer_dashboard />} />
        <Route path="/farmer_history" element={<Farmer_history />} />
        <Route
          path="/transporter_dashboard"
          element={<Transporter_dashboard />}
        />
        <Route path="/transporter_history" element={<Transporter_history />} />
        <Route path="/store_deliveries" element={<Store_deliveries />} />
        <Route path="/store_history" element={<Store_history />} />
        <Route path="/activities" element={<Activity />} />
        <Route path="/list_users" element={<List_user />} />
        <Route path="/product_in_store" element={<Product_in_store />} />
        <Route path="scan_product" element={<Scan_products />} />
      </Routes>
    </Router>
  );
}
