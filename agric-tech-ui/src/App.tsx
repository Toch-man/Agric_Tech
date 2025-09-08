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
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/store_dashboard" element={<Store_dashboard />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/admin_dashboard" element={<Admin_dashboard />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
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

        <Route path="/store_history" element={<Store_history />} />
      </Routes>
    </Router>
  );
}
