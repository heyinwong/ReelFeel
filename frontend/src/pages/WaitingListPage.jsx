import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import HeaderBar from "../components/HeaderBar";
import MovieModal from "../components/MovieModal";
import toast from "react-hot-toast";

function WaitingListPage() {
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
        toast.success("Removed from Watchlist");
      } else {
        console.error("Delete failed:", await res.text());
      }
    } catch (err) {
      console.error("Error deleting movie:", err);
    }
  };

  const handleReview = async (movie) => {
    const hasReviewData =
      movie.user_rating > 0 ||
      movie.liked ||
      (movie.review && movie.review.trim() !== "") ||
      (movie.moods && movie.moods.length > 0);

    if (movie.fromWaiting && hasReviewData) {
      try {
        await fetch("http://localhost:8000/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...movie,
            username,
            fromWaiting: true,
          }),
        });
        await handleDelete(movie); // Remove from frontend
        toast.success("Moved to Watched");
      } catch (err) {
        console.error("❌ Failed to move movie to watched:", err);
        toast.error("Failed to save review");
      }
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
                movie={{ ...movie, mode: "waiting" }}
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

export default WaitingListPage;
