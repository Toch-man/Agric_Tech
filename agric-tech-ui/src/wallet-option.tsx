import { useEffect, useState } from "react";
import { Connector, useConnect } from "wagmi";

export default function WalletOptions() {
  const { connectors, connect } = useConnect();

  // const injected = connectors.find((c) => c.id === "injected");

  // if (!injected) return null;

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
    <div className="mx-[10px]">
      {connector.name.toLowerCase() === "metamask" && (
        <img src="/images/metamask.svg" alt="metamask" className="w-6 h-6" />
      )}

      <button
        className="text-white w-20 h-6 shadow-slate-400 border-2"
        disabled={!ready}
        onClick={onClick}
      >
        {connector.name}
      </button>
    </div>
  );
}
