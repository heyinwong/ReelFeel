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
    // ✅ 新增逻辑：如果是“删除”，就直接调用 handleDelete
    if (movie.delete) {
      await handleDelete(movie);
      return;
    }

    // ✅ 原有逻辑：判断是否为从 waiting list 转移到 watched
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
        await handleDelete(movie);
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
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
      </div>

      <div className="relative z-10 text-white">
        <HeaderBar />
        <div className="px-6 py-8 max-w-screen-xl mx-auto">
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
        onDelete={handleDelete} // ✅ 加上这个！
      />
    </div>
  );
}

export default WaitingListPage;
