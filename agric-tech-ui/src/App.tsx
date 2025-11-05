import { useEffect } from "react";
import { useDisconnect } from "wagmi";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// 📄 Pages
import HomePage from "./pages/home";
import RegisterFarm from "./pages/register";

import Approve from "./pages/registration/approve";
import RequestRole from "./pages/registration/apply_for_role";
import Admin_dashboard from "./pages/admin_dashboard/admin_dashboard";
import Activity from "./pages/admin_dashboard/activity";
import List_user from "./pages/admin_dashboard/view_users";
import Scan_products from "./pages/consumer/scan_product";

//  Farmer
import Farmer_dashboard from "./dashboard/farmer/farmer";
import Farmer_history from "./dashboard/farmer/farmer_history";

//  Transporter
import Transporter_dashboard from "./dashboard/transporter/transporter";
import Transporter_history from "./dashboard/transporter/transporter_history";

//  Store
import Store_dashboard from "./dashboard/store/store";
import Store_history from "./dashboard/store/store_history";
import Product_in_store from "./dashboard/store/product_in_store";
import Store_deliveries from "./dashboard/store/store_delivery";

//  Layouts
import FarmerLayout from "./layouts/farmer_layout";
import TransporterLayout from "./layouts/transporter_layout";
import StoreLayout from "./layouts/store_layout";
import Scan_result from "./pages/consumer/scan_result";

export default function App() {
  const { disconnect } = useDisconnect();

  useEffect(() => {
    // Disconnect wallet once on first load
    disconnect();
  }, [disconnect]);

  return (
    <Router>
      <Routes>
        {/*  Public routes */}
        <Route path="/homePage" element={<HomePage />} />
        <Route path="/register" element={<RegisterFarm />} />

        <Route path="/approve" element={<Approve />} />
        <Route path="/apply_for_role" element={<RequestRole />} />
        <Route path="/scan_product" element={<Scan_products />} />
        <Route path="/product/:id" element={<Scan_result />} />

        {/*  Admin routes */}
        <Route path="/admin_dashboard" element={<Admin_dashboard />} />
        <Route path="/activities" element={<Activity />} />
        <Route path="/list_users" element={<List_user />} />

        {/*  Farmer routes (nested inside FarmerLayout) */}
        <Route path="/farmer" element={<FarmerLayout />}>
          <Route path="dashboard" element={<Farmer_dashboard />} />
          <Route path="history" element={<Farmer_history />} />
        </Route>

        {/*  Transporter routes (nested inside TransporterLayout) */}
        <Route path="/transporter" element={<TransporterLayout />}>
          <Route path="dashboard" element={<Transporter_dashboard />} />
          <Route path="history" element={<Transporter_history />} />
        </Route>

        {/* Store routes (nested inside StoreLayout) */}
        <Route path="/store" element={<StoreLayout />}>
          <Route path="dashboard" element={<Store_dashboard />} />
          <Route path="deliveries" element={<Store_deliveries />} />
          <Route path="history" element={<Store_history />} />
          <Route path="product_in_store" element={<Product_in_store />} />
        </Route>

        {/*redirect */}
        <Route path="*" element={<Navigate to="/homePage" replace />} />
      </Routes>
    </Router>
  );
}
