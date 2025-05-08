import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import HeaderBar from "../components/HeaderBar";
import toast from "react-hot-toast";

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
      fetchMovies(name);
    }
  }, [navigate]);

  const fetchMovies = async (user) => {
    try {
      const res = await fetch(
        `http://localhost:8000/waiting-list?username=${user}`
      );
      const data = await res.json();
      setMovies(data.movies || []);
    } catch (err) {
      console.error("Error fetching waiting list:", err);
    }
  };

  const handleDelete = async (movie) => {
    try {
      const res = await fetch(
        `http://localhost:8000/waiting/${encodeURIComponent(
          movie.title
        )}?username=${username}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setMovies((prev) => prev.filter((m) => m.title !== movie.title));
        toast.success("Deleted from Watchlist");
      } else {
        console.error("Delete failed:", await res.text());
      }
    } catch (err) {
      console.error("Error deleting movie:", err);
    }
  };

  const handleRate = async (data) => {
    try {
      const res = await fetch("http://localhost:8000/rate-waiting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setMovies((prev) => prev.filter((m) => m.title !== data.title));
        toast.success("Rated & moved to Reel Log");
      } else {
        console.error("Rate failed:", await res.text());
      }
    } catch (err) {
      console.error("Error rating:", err);
    }
  };

  const handleLike = async (data) => {
    try {
      const res = await fetch("http://localhost:8000/like-waiting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setMovies((prev) => prev.filter((m) => m.title !== data.title));
        toast.success("Liked & moved to Reel Log");
      } else {
        console.error("Like failed:", await res.text());
      }
    } catch (err) {
      console.error("Error liking:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername("");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 w-full">
      <HeaderBar username={username} onLogout={handleLogout} />
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Watchlist</h1>
        {movies.length === 0 ? (
          <p className="text-gray-500">Your watchlist is empty.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.title}
                title={movie.title}
                poster={movie.poster}
                rating={movie.tmdb_rating}
                userRating={movie.user_rating}
                username={username}
                liked={movie.liked}
                onDelete={handleDelete}
                onRate={handleRate}
                onLike={handleLike}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WaitingListPage;
