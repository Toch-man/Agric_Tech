import { useEffect, useState } from "react";

type User = {
  user_address: `0x${string}`;
  name: string;
  location: string;
  successful_delivery: number;
  role: string;
};
const List_user = () => {
  const [search, set_search] = useState("");
  const [user, set_user] = useState<User[] | []>([]);

  return (
    <div>
      <h1>Available Users</h1>
      <div className="relative">
        <input
          type="text"
          placeholder="Search"
          className="border hidden md:block border-gray-300 rounded-full py-2 px-4 w-64 focus:outline-none"
        />
        <span className="absolute right-3 md:right-4 md:top-2.5 top-[-8px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="md:h-5 md:w-5 w-6 h-6 md:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
      </div>
      <p>Total user {user.length}</p>
      {user.length == 0 ? (
        <div>No user with that address</div>
      ) : (
        <>
          <table>
            {user.map((u) => (
              <tr>
                <td>{u.user_address}</td>
                <td>{u.name}</td>
                <td>{u.location}</td>
                <td>{u.role}</td>
                <td>{u.successful_delivery}</td>
                <td>
                  <button>Resign user</button>
                </td>
              </tr>
            ))}
          </table>
        </>
      )}
    </div>
  );
};

export default List_user;
