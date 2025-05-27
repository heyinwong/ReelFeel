import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import toast from "react-hot-toast";

function RecommendBlock({ recommendations, loading, user, onCardClick }) {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const total = recommendations.length;

  const handleAdd = async (movie, listType) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const endpoint = listType === "watched" ? "watched" : "waiting";
    try {
      const response = await API.post(`/${endpoint}`, {
        ...movie,
        watch_date: new Date().toISOString().split("T")[0],
      });

      if (response.status !== 200) {
        throw new Error(response.data?.detail || "Failed to add");
      }

      toast.success(
        `Added to ${listType === "watched" ? "Reel Log" : "Watchlist"}`
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to add movie.");
    }
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-12">
        <div className="w-8 h-8 border-4 border-orange-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) return null;

  // === Single Movie Version ===
  if (total === 1) {
    const movie = recommendations[0];
    return (
      <div className="w-full max-w-4xl mx-auto mt-12 relative">
        <div className="flex justify-center items-center h-60">
          <div
            className="w-80 h-52 scale-110 rounded-xl overflow-hidden shadow-lg cursor-pointer"
            style={{
              backgroundImage: "url('/card.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              padding: "10px",
            }}
            onClick={() => onCardClick && onCardClick(movie)}
          >
            <img
              src={movie.backdrop}
              alt={movie.title}
              className="w-full h-full object-cover rounded"
            />
          </div>
        </div>

        <div className="bg-[#F3E2D4] text-[#281B13] mt-12 rounded-2xl shadow-xl px-8 py-6 max-w-4xl mx-auto text-center min-h-[260px]">
          <h3 className="text-xl font-bold mb-2">{movie.title}</h3>
          <p className="text-yellow-600 font-semibold mb-2">
            ⭐{" "}
            {movie.tmdb_rating ? Number(movie.tmdb_rating).toFixed(1) : "N/A"}
          </p>
          <p className="text-sm mb-4">{movie.description}</p>
          {movie.reason && (
            <p className="text-sm italic text-gray-600 mb-4">
              Recommendation: {movie.reason}
            </p>
          )}
          <div className="flex justify-center gap-3">
            <button
              className="bg-[#FC7023] hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold"
              onClick={() => handleAdd(movie, "watched")}
            >
              Watched
            </button>
            <button
              className="bg-[#FC7023] hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold"
              onClick={() => handleAdd(movie, "waiting")}
            >
              Watchlist
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === Carousel Version ===
  const prevIndex = (current - 1 + total) % total;
  const nextIndex = (current + 1) % total;
  const visibleMovies = [
    recommendations[prevIndex],
    recommendations[current],
    recommendations[nextIndex],
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 relative">
      <div className="flex justify-center items-center gap-6 relative h-60">
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-2xl text-white bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full px-3 py-1"
        >
          ←
        </button>
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-2xl text-white bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full px-3 py-1"
        >
          →
        </button>

        {visibleMovies.map((movie, idx) => {
          const isCenter = idx === 1;
          return (
            <div
              key={movie.title + idx}
              className={`transition-all duration-300 flex-shrink-0 rounded-xl overflow-hidden shadow-md cursor-pointer ${
                isCenter ? "w-80 h-52 scale-110 z-10" : "w-40 h-28 opacity-50"
              }`}
              style={{
                backgroundImage: "url('/card.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                padding: isCenter ? "10px" : "4px",
              }}
              onClick={() =>
                isCenter
                  ? onCardClick?.(movie)
                  : setCurrent((current + idx - 1 + total) % total)
              }
            >
              <img
                src={movie.backdrop}
                alt={movie.title}
                className="w-full h-full object-cover rounded"
              />
            </div>
          );
        })}
      </div>

      <div className="bg-[#F3E2D4] text-[#281B13] mt-12 rounded-2xl shadow-xl px-8 py-6 max-w-4xl mx-auto text-center min-h-[260px]">
        <h3 className="text-xl font-bold mb-2">
          {recommendations[current].title}
        </h3>
        <p className="text-yellow-600 font-semibold mb-2">
          ⭐{" "}
          {recommendations[current].tmdb_rating
            ? Number(recommendations[current].tmdb_rating).toFixed(1)
            : "N/A"}
        </p>
        <p className="text-sm mb-4">{recommendations[current].description}</p>
        {recommendations[current].reason && (
          <p className="text-sm italic text-gray-600 mb-4">
            Recommendation: {recommendations[current].reason}
          </p>
        )}
        <div className="flex justify-center gap-3">
          <button
            className="bg-[#FC7023] hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold"
            onClick={() => handleAdd(recommendations[current], "watched")}
          >
            Watched
          </button>
          <button
            className="bg-[#FC7023] hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold"
            onClick={() => handleAdd(recommendations[current], "waiting")}
          >
            Watchlist
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecommendBlock;
