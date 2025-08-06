// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const agricTechModule = buildModule("agricTechModule", (m) => {
  const agricTech = m.contract("AgricTech", []);

  return { agricTech };
});

export default agricTechModule;
