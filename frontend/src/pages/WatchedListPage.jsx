import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";

function WatchedListPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("username");
    if (!name) {
      navigate("/login");
    } else {
      setUsername(name);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername("");
    navigate("/");
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-100">
      <HeaderBar username={username} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🎬 Watched List
        </h1>
        <p className="text-gray-600">
          This is where your watched movies will appear.
        </p>
      </div>
    </div>
  );
}

export default WatchedListPage;
