import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import HeaderBar from "../components/HeaderBar";
import MovieModal from "../components/MovieModal";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import API from "../utils/api";

function WaitingListPage() {
  const { user, isLoading } = useAuth();
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    } else if (user) {
      fetchMovies();
    }
  }, [user, isLoading, navigate]);

  const fetchMovies = async () => {
    try {
      const res = await API.get("/waiting-list");
      setMovies(res.data.movies || []);
    } catch (err) {
      console.error("Error fetching waiting list:", err);
    }
  };

  const handleDelete = async (movie) => {
    try {
      const res = await API.delete(
        `/waiting/${encodeURIComponent(movie.title)}`
      );
      if (res.status === 200) {
        setMovies((prev) => prev.filter((m) => m.title !== movie.title));
        toast.success("Removed from Watchlist");
      } else {
        console.error("Delete failed:", res);
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
        await API.post("/review", {
          ...movie,
          fromWaiting: true,
        });
        await handleDelete(movie); // Remove from frontend
        toast.success("Moved to Watched");
      } catch (err) {
        console.error("❌ Failed to move movie to watched:", err);
        toast.error("Failed to save review");
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* 背景图 + 滤镜 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/reel_wall.jpg')",
          backgroundAttachment: "fixed",
          filter: "hue-rotate(150deg) brightness(0.9) saturate(0.9)",
        }}
      />
      {/* 背景上的遮罩效果（顶部压暗，底部轻光） */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* 顶部暗角（增加聚焦感） */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        {/* 整体柔光混合（提升内容清晰度） */}
        <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
      </div>

      {/* 前景内容 */}
      <div className="relative z-10 text-white">
        <HeaderBar />
        <div className="px-6 py-8 max-w-screen-xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Watchlist</h1>
          {movies.length === 0 ? (
            <p className="text-gray-200">Your watchlist is empty.</p>
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
