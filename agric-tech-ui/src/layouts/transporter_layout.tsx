import Header from "./header";
import { Outlet } from "react-router-dom";

export default function TransporterLayout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-black">
        <Header />
      </header>
      <main className="relative z-0">
        <Outlet />
      </main>
    </div>
  );
}
