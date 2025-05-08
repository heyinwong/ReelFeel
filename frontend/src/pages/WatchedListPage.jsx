import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";
import MovieCard from "../components/MovieCard";
import MovieModal from "../components/MovieModal";

function WatchedListPage() {
  const [movies, setMovies] = useState([]);
  const [username, setUsername] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
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
        `http://localhost:8000/watched-list?username=${user}`
      );
      const data = await res.json();
      setMovies(data.movies || []);
    } catch (err) {
      console.error("Error fetching watched list:", err);
    }
  };

  const handleDelete = async (movie) => {
    try {
      const res = await fetch(
        `http://localhost:8000/watched/${encodeURIComponent(
          movie.title
        )}?username=${username}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setMovies((prev) => prev.filter((m) => m.title !== movie.title));
      } else {
        console.error("Failed to delete:", await res.text());
      }
    } catch (err) {
      console.error("Error deleting movie:", err);
    }
  };

  const handleRate = async (movie) => {
    try {
      const res = await fetch("http://localhost:8000/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          title: movie.title,
          user_rating: movie.user_rating, // ✅ fixed key
        }),
      });
      if (res.ok) {
        setMovies((prev) =>
          prev.map((m) =>
            m.title === movie.title
              ? { ...m, user_rating: movie.user_rating }
              : m
          )
        );
      }
    } catch (err) {
      console.error("Error rating movie:", err);
    }
  };

  const handleLike = async (movie) => {
    try {
      const res = await fetch("http://localhost:8000/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          title: movie.title,
          liked: movie.liked,
        }),
      });
      if (res.ok) {
        setMovies((prev) =>
          prev.map((m) =>
            m.title === movie.title ? { ...m, liked: movie.liked } : m
          )
        );
      }
    } catch (err) {
      console.error("Error liking movie:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername("");
    navigate("/");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center w-full"
      style={{
        backgroundImage: "url('/reel_wall.jpg')",
        backgroundAttachment: "fixed",
      }}
    >
      <HeaderBar username={username} onLogout={handleLogout} />
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        {movies.length === 0 ? (
          <p className="text-gray-100">Your watched list is empty.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {movies.map((movie, index) => (
              <MovieCard
                key={index}
                title={movie.title}
                poster={movie.poster}
                rating={movie.tmdb_rating}
                user_rating={movie.user_rating}
                liked={movie.liked}
                username={username}
                onDelete={handleDelete}
                onClick={() => setSelectedMovie(movie)}
                onRate={handleRate}
                onLike={handleLike}
              />
            ))}
          </div>
        )}
      </div>
      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}

export default WatchedListPage;
