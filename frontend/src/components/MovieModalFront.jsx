import React from "react";
import UserMovieStats from "./UserMovieStats";

function MovieModalFront({ movie, onFlip, readOnly }) {
  const isWatched = movie.mode === "watched";

  return (
    <div className="absolute inset-0 flex flex-col lg:flex-row bg-white rounded-xl shadow-lg overflow-hidden max-h-[90vh] [backface-visibility:hidden]">
      {/* 图片区域：竖屏在上，横屏在左 */}
      <div className="w-full lg:w-1/2 h-60 sm:h-72 lg:h-auto">
        <img
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 信息区域 */}
      <div className="w-full lg:w-1/2 bg-[#281B13] text-[#F3E2D4] px-4 sm:px-6 py-6 flex flex-col justify-between border-t-4 lg:border-t-0 lg:border-l-4 border-[#FC7023] max-h-[90vh] overflow-auto">
        <div className="space-y-3 flex-grow overflow-auto pr-1">
          <h2 className="text-xl sm:text-2xl font-bold">{movie.title}</h2>

          {movie.director && (
            <p className="text-sm sm:text-base text-[#F3E2D4]/80">
              <strong className="text-[#FC7023]">Director:</strong>{" "}
              {movie.director}
            </p>
          )}

          <p className="text-sm sm:text-base text-[#F3E2D4]/80">
            <strong className="text-[#FC7023]">TMDB Score:</strong>{" "}
            {movie.tmdb_rating ? Number(movie.tmdb_rating).toFixed(1) : "N/A"}
          </p>

          {movie.genres && (
            <p className="text-sm sm:text-base text-[#F3E2D4]/80">
              <strong className="text-[#FC7023]">Genres:</strong> {movie.genres}
            </p>
          )}

          {movie.release_year && (
            <p className="text-sm sm:text-base text-[#F3E2D4]/80">
              <strong className="text-[#FC7023]">Year:</strong>{" "}
              {movie.release_year}
            </p>
          )}

          {/* 描述文字：限制高度可滚动 */}
          <div className="text-sm sm:text-base leading-relaxed text-[#F3E2D4]/90 max-h-40 overflow-y-auto pr-1">
            {movie.description || "No description available."}
          </div>
        </div>

        {/* 观看过的用户信息展示 */}
        {isWatched && (
          <div className="mt-6">
            <UserMovieStats
              rating={movie.user_rating}
              liked={movie.liked}
              watchDate={movie.watch_date}
            />
          </div>
        )}

        {/* 按钮底部吸附 */}
        {!readOnly && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={onFlip}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#FC7023] text-[#281B13] font-medium hover:bg-[#ff8c3a] transition"
            >
              Write your thoughts →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieModalFront;
