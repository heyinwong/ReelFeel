function MovieDetailBlock({ movie, onAdd }) {
  if (!movie) return null;

  return (
    <div className="bg-[#F3E2D4] text-[#281B13] mt-12 rounded-2xl shadow-xl px-8 py-6 max-w-4xl mx-auto text-center min-h-[260px]">
      <h3 className="text-xl font-bold mb-2">{movie.title}</h3>
      <p className="text-yellow-600 font-semibold mb-2">
        ⭐ {movie.tmdb_rating ? Number(movie.tmdb_rating).toFixed(1) : "N/A"}
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
          onClick={() => onAdd(movie, "watched")}
        >
          Watched
        </button>
        <button
          className="bg-[#FC7023] hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold"
          onClick={() => onAdd(movie, "waiting")}
        >
          Watchlist
        </button>
      </div>
    </div>
  );
}

export default MovieDetailBlock;
