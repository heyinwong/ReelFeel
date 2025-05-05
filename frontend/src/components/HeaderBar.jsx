import { useNavigate } from "react-router-dom";

function HeaderBar({ username, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white shadow-md">
      <h1
        className="text-2xl font-bold text-gray-800 cursor-pointer"
        onClick={() => navigate("/")}
      >
        🎬 ReelFeel
      </h1>
      <nav className="space-x-6 text-gray-700">
        <button
          onClick={() => navigate("/watched")}
          className="hover:underline"
        >
          Watched List
        </button>
        <button
          onClick={() => navigate("/waiting")}
          className="hover:underline"
        >
          Waiting List
        </button>
        {username ? (
          <button onClick={onLogout} className="hover:underline">
            Logout ({username})
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="hover:underline"
          >
            Login
          </button>
        )}
      </nav>
    </header>
  );
}

export default HeaderBar;
