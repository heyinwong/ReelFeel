function MovieDetailBlock({ movie, onAdd }) {
  if (!movie) return null;

  return (
    <div className="bg-gradient-to-br from-[#F9EFE4] to-[#F3E2D4] text-[#281B13] mt-14 rounded-3xl shadow-2xl px-10 py-8 max-w-4xl mx-auto relative overflow-hidden border border-[#FC7023] animate-fade-in">
      {/* 背景点缀纹理 */}
      <div className="absolute inset-0 opacity-5 bg-[url('/film-texture.png')] bg-repeat pointer-events-none" />

      {/* 标题 */}
      <h3 className="text-3xl font-extrabold mb-2 tracking-wide text-center">
        {movie.title}
      </h3>

      {/* TMDB评分 */}
      <p className="text-[#FC7023] text-lg font-semibold text-center mb-3">
        TMDB Rating:{" "}
        {movie.tmdb_rating ? Number(movie.tmdb_rating).toFixed(1) : "N/A"}
      </p>

      {/* 简介 */}
      <p className="text-sm leading-relaxed mb-4 px-2 text-center">
        {movie.description}
      </p>

      {/* AI推荐理由 */}
      {movie.reason && (
        <div className="bg-[#fff3e6] border-l-4 border-[#FC7023] p-4 mb-5 rounded group hover:bg-[#ffeedd] hover:shadow-inner transition-all duration-300">
          <div className="text-xs font-semibold text-[#FC7023] mb-1">
            AI Insight
          </div>
          <p className="text-sm italic text-[#444]">{movie.reason}</p>
        </div>
      )}

      {/* 按钮区 */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          className="bg-[#FC7023] hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-bold transition-all duration-200 transform hover:-translate-y-1 hover:scale-105 hover:shadow-lg"
          onClick={() => onAdd(movie, "watched")}
        >
          + Add to Reel Log
        </button>
        <button
          className="bg-[#FC7023] hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-bold transition-all duration-200 transform hover:-translate-y-1 hover:scale-105 hover:shadow-lg"
          onClick={() => onAdd(movie, "waiting")}
        >
          + Add to Watchlist
        </button>
      </div>
    </div>
  );
}

export default MovieDetailBlock;
