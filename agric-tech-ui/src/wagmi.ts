import { http, createConfig } from "wagmi";
import { celoAlfajores } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [celoAlfajores],
  connectors: [injected()],
  transports: {
    [celoAlfajores.id]: http("https://alfajores-forno.celo-testnet.org"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
