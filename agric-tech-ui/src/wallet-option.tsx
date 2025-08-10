import { useEffect, useState } from "react";
import { Connector, useConnect } from "wagmi";

export default function WalletOptions() {
  const { connectors, connect } = useConnect();
  return connectors
    .filter(
      (connector) =>
        connector.id !== "injected" || connector.name !== "Injected"
    )
    .map((connector) => (
      <WalletOption
        key={connector.uid}
        connector={connector}
        onClick={() => connect({ connector })}
      />
    ));
}

function WalletOption({
  connector,
  onClick,
}: {
  key: string;
  connector: Connector;
  onClick: () => void;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fetchProvider = async function () {
      const provider = connector.getProvider();
      setReady(!!provider);
    };
    fetchProvider();
  }, [connector]);

  return (
    <div className="flex flex-col justify-center m-10">
      {connector.name.toLowerCase() === "metamask" && (
        <img
          src="/images/metamask.svg"
          alt="metamask"
          className="w-10 my-2 h-10 mx-auto"
        />
      )}

      <button
        className="text-white bg-green-600 text-center  w-25 p-2 h-10  border-2"
        disabled={!ready}
        onClick={onClick}
      >
        {connector.name}
      </button>
    </div>
  );
}
