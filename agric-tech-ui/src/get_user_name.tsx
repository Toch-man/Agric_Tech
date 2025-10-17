import { readContract } from "wagmi/actions";
import { wagmiContractConfig } from "./contracts/contract";
import { config } from "./wagmi";

export async function getUserName(userAddress: `0x${string}`) {
  const data = await readContract(config, {
    ...wagmiContractConfig,
    functionName: "get_user_name",
    args: [userAddress],
  });

  return String(data);
}
