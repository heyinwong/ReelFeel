import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import HeaderBar from "../components/HeaderBar";
import MovieModal from "../components/MovieModal";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import API from "../utils/api";
import Footer from "../components/Footer";
import MovieFilterBar from "../components/MovieFilterBar";

function WaitingListPage() {
  const { user, isLoading } = useAuth();
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [sortOption, setSortOption] = useState("added");
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
    if (movie.delete) {
      await handleDelete(movie);
      return;
    }

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

  const sorted = [...movies].sort((a, b) => {
    if (sortOption === "title") {
      return a.title.localeCompare(b.title);
    }
    return 0; // default to added order
  });

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      {/* 背景图 + 滤镜 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/theater.jpg')",
          backgroundAttachment: "fixed",
        }}
      />
      <div className="absolute inset-0 bg-black/20 mix-blend-multiply pointer-events-none" />
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex-grow text-white">
        <HeaderBar />
        <div className="px-6 pt-8 max-w-screen-xl mx-auto">
          <MovieFilterBar
            sortOption={sortOption}
            setSortOption={setSortOption}
            filterOption={null}
            setFilterOption={() => {}}
            sortOptions={[
              { value: "added", label: "Sort by Added" },
              { value: "title", label: "Sort by Title" },
            ]}
            hideFilter={true}
          />

          {sorted.length === 0 ? (
            <p className="text-gray-200">Your watchlist is empty.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {sorted.map((movie) => (
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
        onDelete={handleDelete}
      />

      <Footer />
    </div>
  );
}

export default WaitingListPage;
