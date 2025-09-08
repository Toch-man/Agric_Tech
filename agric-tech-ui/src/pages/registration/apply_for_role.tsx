import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { wagmiContractConfig } from "../../contracts/contract";
import { useWaitForTransactionReceipt } from "wagmi";

const RequestRole = () => {
  const [role, setRole] = useState("");
  const [location, set_location] = useState("");
  const [name, set_name] = useState("");
  const { address, isConnected } = useAccount();
  const [txHash, set_txHash] = useState<`0x${string}` | undefined>(undefined);
  const [is_submitting, set_is_submitting] = useState(false);
  const roles = ["None", "Farmer", "Transporter", "Store-Manager"];

  const { writeContractAsync } = useWriteContract();

  const {
    isSuccess: isConfirmed,
    isError: isConfirmationError,
    error: confirmationError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
    query: { enabled: !!txHash, retry: 3, retryDelay: 1000 },
  });

  const apply = useMutation({
    mutationFn: async (data: {
      name: string;
      location: string;
      role: string;
    }) => {
      try {
        if (!isConnected || address) return;
        set_is_submitting(true);
        const hash = await writeContractAsync({
          ...wagmiContractConfig,
          functionName: "",
          args: [data.name, data.location, data.role],
        });
        set_txHash(hash);
      } catch (error) {
        set_is_submitting(false);
      }
    },
  });

  const get_button_message = () => {
    if (apply.isPending || is_submitting) return "Preparing";
    return "Deliver";
  };

  const get_status_message = () => {
    if (isConfirmed) return "Transaction successful";
    if (isConfirmationError) return "Transaction failed try again";
    if (apply.isPending && !txHash) return "preparing transaction";
    if (txHash && !isConfirmationError && confirmationError)
      return "confirming transactioon";
  };
  return (
    <div>
      <h1>Assign roles</h1>
      <form
        onSubmit={() =>
          apply.mutate({ name: name, location: location, role: role })
        }
      >
        <input
          type="text"
          value={name}
          onChange={(e) => set_name(e.target.value)}
        ></input>
        <br />
        <input
          type="text"
          value={location}
          onChange={(e) => set_location(e.target.value)}
        ></input>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          {roles.map((role, i) => (
            <option key={i} id={role}>
              {role}
            </option>
          ))}
        </select>
        {txHash && <p>{txHash}</p>}
        {txHash && <p>{get_status_message()}</p>}
        <button type="submit">{get_button_message()}</button>
      </form>
    </div>
  );
};

export default RequestRole;
