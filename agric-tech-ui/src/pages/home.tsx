import Header from "../layout/header";

export default function HomePage() {
  // this page depending on if the acct connected is from the admin ,a farme rtc
  return (
    <Header>
      <div className="bg-[url('/images/background.jpg')]  bg-cover bg-center  h-screen w-full">
        <div className="flex flex-col justify-center items-center h-full">
          <h1 className="text-[36px] lg:text-[46px] font-bold text-yellow-200">
            Welcome to .... Farm to store tracker{" "}
          </h1>
          <br />
          <p className="text-[20px] lg:text-[31px]  font-bold text-yellow-200">
            Please connect your ethereum wallet to begin
          </p>
        </div>
      </div>
    </Header>
  );
}
