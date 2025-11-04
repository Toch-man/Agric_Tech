import Header from "./header";
import { Outlet } from "react-router-dom";

export default function TransporterLayout() {
  return (
    <div>
      <Header />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
