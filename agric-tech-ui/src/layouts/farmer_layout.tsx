import { Outlet } from "react-router-dom";
import Header from "./header"; // or FarmerHeader if you have one

export default function FarmerLayout() {
  return (
    <div>
      <Header />
      <main className="p-4">
        <Outlet /> {/* child pages go here */}
      </main>
    </div>
  );
}
