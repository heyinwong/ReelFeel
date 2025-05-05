import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";
import MovieCard from "../components/MovieCard";

function WaitingListPage() {
  const sampleMovies = [
    {
      title: "Inception",
      posterUrl:
        "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg",
      rating: "8.8",
    },
    {
      title: "Interstellar",
      posterUrl:
        "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      rating: "8.6",
    },
    {
      title: "The Matrix",
      posterUrl:
        "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
      rating: "8.7",
    },
  ];
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) {
      navigate("/login");
    } else {
      setUsername(username);
    }
  }, [navigate]);
  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername("");
    navigate("/");
  };
  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderBar username={username} onLogout={handleLogout} />
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          🎬 Waiting List
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {sampleMovies.map((movie, index) => (
            <MovieCard key={index} {...movie} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default WaitingListPage;
