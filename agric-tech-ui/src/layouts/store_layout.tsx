import { Outlet } from "react-router-dom";
import Header from "./header";

export default function StoreLayout() {
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
