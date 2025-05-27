import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";
import MovieCard from "../components/MovieCard";
import MovieModal from "../components/MovieModal";
import useAuth from "../hooks/useAuth";
import API from "../utils/api";
import MovieFilterBar from "../components/MovieFilterBar";
import Footer from "../components/Footer";

function WatchedListPage() {
  const { user, isLoading } = useAuth();
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [sortOption, setSortOption] = useState("added");
  const [filterOption, setFilterOption] = useState("all");
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

  const sortedAndFiltered = [...movies]
    .filter((m) => {
      if (filterOption === "unreview") {
        return !m.user_rating && !m.review && !m.liked && !m.watch_date;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOption === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortOption === "rating") {
        return (b.user_rating || 0) - (a.user_rating || 0);
      } else if (sortOption === "watchdate") {
        return new Date(b.watch_date) - new Date(a.watch_date);
      }
      return 0;
    });

  return (
    <div className="min-h-screen flex flex-col relative w-full overflow-x-hidden">
      {/* 背景层 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/reel_wall.jpg')",
          backgroundAttachment: "fixed",
        }}
      />
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
      </div>

      {/* 主内容区域 */}
      <div className="relative z-10 flex-1">
        <HeaderBar />

        <div className="px-6 pt-8 max-w-screen-xl mx-auto">
          <MovieFilterBar
            sortOption={sortOption}
            setSortOption={setSortOption}
            filterOption={filterOption}
            setFilterOption={setFilterOption}
            sortOptions={[
              { value: "added", label: "Sort by Added" },
              { value: "title", label: "Sort by Title" },
              { value: "rating", label: "Sort by Rating" },
              { value: "watchdate", label: "Sort by Watch Date" },
            ]}
            filterOptions={[
              { value: "all", label: "All" },
              { value: "unreview", label: "Unreviewed Only" },
            ]}
          />

          {sortedAndFiltered.length === 0 ? (
            <p className="text-gray-100">No movies match your criteria.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {sortedAndFiltered.map((movie) => (
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
          onDelete={handleDelete}
        />
      </div>

      {/* Footer 固定在底部 */}
      <Footer />
    </div>
  );
}

export default WatchedListPage;
