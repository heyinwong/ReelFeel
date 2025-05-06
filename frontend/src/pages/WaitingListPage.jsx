import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";
import MovieCard from "../components/MovieCard";

function WaitingListPage() {
  const [movies, setMovies] = useState([]);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("username");
    if (!name) {
      navigate("/login");
    } else {
      setUsername(name);
    }

    const stored = JSON.parse(localStorage.getItem("waitingList")) || [];
    setMovies(stored);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername("");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 w-full">
      <HeaderBar username={username} onLogout={handleLogout} />
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Waiting List</h1>
        {movies.length === 0 ? (
          <p className="text-gray-500">Your waiting list is empty.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {movies.map((movie, index) => (
              <MovieCard key={index} {...movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WaitingListPage;
