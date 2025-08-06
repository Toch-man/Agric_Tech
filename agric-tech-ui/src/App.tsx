import HomePage from "./pages/home";
import RegisterFarm from "./pages/register";
import Dashboard from "./pages/dashBoard";
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
        <Route path="/homePage" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/HomePage" replace />} />
        <Route path="/register" element={<RegisterFarm />} />
        <Route path="/dashBoard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
