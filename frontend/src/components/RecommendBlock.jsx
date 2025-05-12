import { useState } from "react";

function RecommendBlock({ recommendations, loading, username }) {
  const [current, setCurrent] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleAdd = async (movie, listType) => {
    const endpoint = listType === "watched" ? "watched" : "waiting";
    try {
      const response = await fetch(`http://localhost:8000/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...movie,
          username,
          watch_date: new Date().toISOString().split("T")[0], // 仅 watched 可用
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to add");

      setFeedback(
        `✅ Added to ${listType === "watched" ? "Reel Log" : "Watchlist"}`
      );
      setTimeout(() => setFeedback(""), 3000);
    } catch (error) {
      console.error(error);
      setFeedback("❌ Failed to add movie.");
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? recommendations.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === recommendations.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <p className="text-gray-400 italic text-center mt-6">
        Loading recommendations...
      </p>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <p className="text-gray-500 italic text-center mt-6">
        No recommendations to display.
      </p>
    );
  }

  const total = recommendations.length;
  const prevIndex = (current - 1 + total) % total;
  const nextIndex = (current + 1) % total;

  const visibleMovies = [
    recommendations[prevIndex],
    recommendations[current],
    recommendations[nextIndex],
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 relative">
      {/* Carousel */}
      <div className="flex justify-center items-center gap-6 relative h-60">
        {/* Arrows */}
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

        {visibleMovies.map((movie, idx) => (
          <div
            key={movie.title + idx}
            className={`transition-all duration-300 flex-shrink-0 rounded-xl overflow-hidden shadow-md cursor-pointer ${
              idx === 1 ? "w-80 h-52 scale-110 z-10" : "w-40 h-28 opacity-50"
            }`}
            style={{
              backgroundImage: "url('/card.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              padding: idx === 1 ? "10px" : "4px",
            }}
            onClick={() => setCurrent((current + idx - 1 + total) % total)}
          >
            <img
              src={movie.backdrop}
              alt={movie.title}
              className="w-full h-full object-cover rounded"
            />
          </div>
        ))}
      </div>

      {/* Detail Block */}
      <div className="bg-white/90 text-black mt-8 rounded-xl shadow-md px-6 py-5 max-w-3xl mx-auto text-center min-h-[240px]">
        <h3 className="text-xl font-bold mb-2">
          {recommendations[current].title}
        </h3>
        <p className="text-yellow-600 font-semibold mb-2">
          ⭐ {recommendations[current].tmdb_rating ?? "N/A"}
        </p>
        <p className="text-sm mb-4">{recommendations[current].description}</p>
        <div className="flex justify-center gap-3">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={() => handleAdd(recommendations[current], "watched")}
          >
            Watched
          </button>
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            onClick={() => handleAdd(recommendations[current], "waiting")}
          >
            Watchlist
          </button>
        </div>
        {feedback && (
          <p className="text-sm mt-4 text-green-600 font-medium">{feedback}</p>
        )}
      </div>
    </div>
  );
}

export default RecommendBlock;
