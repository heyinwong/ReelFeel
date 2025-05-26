import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";
import MovieCard from "../components/MovieCard";
import MovieModal from "../components/MovieModal";
import useAuth from "../hooks/useAuth";
import API from "../utils/api";
import { useDashboardRefresh } from "./DashboardPage"; // 根据路径调整
function WatchedListPage() {
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
      const res = await API.get("/watched-list");
      setMovies(res.data.movies || []);
    } catch (err) {
      console.error("Error fetching watched list:", err);
    }
  };

  const handleDelete = async (movie) => {
    try {
      const res = await API.delete(
        `/watched/${encodeURIComponent(movie.title)}`
      );
      if (res.status === 200) {
        setMovies((prev) => prev.filter((m) => m.title !== movie.title));
      } else {
        console.error("Failed to delete:", res);
      }
    } catch (err) {
      console.error("Error deleting movie:", err);
    }
  };

  const handleReview = async (movie) => {
    if (movie.delete) {
      await handleDelete(movie);
      return;
    }

    try {
      const res = await API.post("/review", {
        title: movie.title,
        user_rating: movie.user_rating,
        liked: movie.liked,
        review: movie.review,
        moods: movie.moods,
        watch_date: movie.watch_date,
      });

      if (res.status === 200) {
        setMovies((prev) =>
          prev.map((m) => (m.title === movie.title ? { ...m, ...movie } : m))
        );
      }
    } catch (err) {
      console.error("Error saving review:", err);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* 背景图 + 遮罩 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/reel_wall.jpg')" }}
      />
      {/* 背景上的遮罩效果（顶部压暗，底部轻光） */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* 顶部暗角（增加聚焦感） */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        {/* 整体柔光混合（提升内容清晰度） */}
        <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
      </div>
      {/* 主内容区 */}
      <div className="relative z-10">
        <HeaderBar />
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
          onDelete={handleDelete} // ✅ 加上这个！
        />
      </div>
    </div>
  );
}

export default WatchedListPage;
