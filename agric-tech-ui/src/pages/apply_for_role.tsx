import { useState } from "react";

const RequestRole = () => {
  const [role, setRole] = useState("");

  const roles = ["None", "Farmer", "Transporter", "Store-Manager"];

  return (
    <div>
      <h1>Assign roles</h1>
      <form>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          {roles.map((role, i) => (
            <option key={i} id={role}>
              {role}
            </option>
          ))}
        </select>
        <button>Apply</button>
      </form>
    </div>
  );
};

export default RequestRole;
