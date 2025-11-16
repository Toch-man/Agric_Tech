import { Outlet } from "react-router-dom";
import Header from "./header"; // or FarmerHeader if you have one

// layouts/farmer_layout.tsx
export default function FarmerLayout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-100">
        <Header />
      </header>
      <main className="relative z-0">
        <Outlet />
      </main>
    </div>
  );
}
