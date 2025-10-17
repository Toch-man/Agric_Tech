// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const agricTechModule = buildModule("agricTechModule", (m) => {
  const agricTech = m.contract("FarmToStoreTraceability", []);

  return { agricTech };
});

export default agricTechModule;
0xc1a12d4bbf6d1bc5ab50d77e7b965aced4e16f50;
