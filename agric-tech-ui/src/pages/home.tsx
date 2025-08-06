import Header from "../layout/header";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  function handle_register_button() {
    navigate("/register");
  }

  return (
    <Header>
      <div className="bg-[url('/images/background.jpg')] bg-cover bg-center h-screen w-full">
        <div className="flex flex-row justify-center items-center h-full">
          <button
            className=" w-[150px] h-[50px] bg-green-300 border-2 border-black rounded"
            onClick={() => handle_register_button()}
          >
            Register farm
          </button>
        </div>
      </div>
    </Header>
  );
}
