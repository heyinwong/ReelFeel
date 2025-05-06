function RecommendBlock({ recommendations, loading }) {
  // Called when user clicks "Add to Watched"
  const handleAddToWatched = (movie) => {
    const stored = JSON.parse(localStorage.getItem("watchedList")) || [];
    const updated = [...stored, movie];
    localStorage.setItem("watchedList", JSON.stringify(updated));
  };

  // Called when user clicks "Add to Waiting"
  const handleAddToWaiting = (movie) => {
    const stored = JSON.parse(localStorage.getItem("waitingList")) || [];
    const updated = [...stored, movie];
    localStorage.setItem("waitingList", JSON.stringify(updated));
  };
  return (
    <div className="mt-8 w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Movie Recommendations
      </h2>

      {loading ? (
        <p className="text-gray-500 italic">Loading recommendations...</p>
      ) : recommendations && recommendations.length > 0 ? (
        <div className="space-y-6">
          {recommendations.map((movie, index) => (
            <div
              key={index}
              className="flex bg-white rounded-lg shadow p-4 gap-4"
            >
              {/* Left section: Poster image */}
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-32 h-auto rounded object-cover"
                />
              ) : (
                <div className="w-32 h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}

              {/* Right section: Movie details */}
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {movie.title}
                  </h3>
                  <p className="text-sm text-yellow-600 mb-2">
                    ⭐: {movie.rating ?? "N/A"}
                  </p>
                  <p className="text-gray-700 text-sm">
                    {movie.description || "No description available."}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="mt-4 space-x-3">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    onClick={() => handleAddToWatched(movie)}
                  >
                    Add to Watched
                  </button>
                  <button
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                    onClick={() => handleAddToWaiting(movie)}
                  >
                    Add to To Watch
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">No recommendations to display.</p>
      )}
    </div>
  );
}

export default RecommendBlock;
