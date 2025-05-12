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

  // 删除 handleRate 和 handleLike
  // 替换 handleReview 为：

  const handleReview = async (movie) => {
    if (movie.delete) {
      await handleDelete(movie);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          title: movie.title,
          user_rating: movie.user_rating,
          liked: movie.liked,
          review: movie.review,
          moods: movie.moods,
          watch_date: movie.watch_date,
        }),
      });

      if (res.ok) {
        setMovies((prev) =>
          prev.map((m) => (m.title === movie.title ? { ...m, ...movie } : m))
        );
      }
    } catch (err) {
      console.error("Error saving review:", err);
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
            {movies.map((movie) => (
              <MovieCard
                key={movie.title}
                movie={{ ...movie, mode: "watched" }}
                onClick={setSelectedMovie}
              />
            ))}
          </div>
        )}
      </div>
      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        onReview={handleReview}
      />
    </div>
  );
}

export default WatchedListPage;
