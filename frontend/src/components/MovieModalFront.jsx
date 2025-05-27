import React from "react";
import UserMovieStats from "./UserMovieStats";

function MovieModalFront({ movie, onFlip, readOnly }) {
  const isWatched = movie.mode === "watched";

  return (
    <div className="absolute inset-0 flex flex-col lg:flex-row bg-white rounded-xl shadow-lg overflow-hidden [backface-visibility:hidden]">
      {/* 左侧图片区域 */}
      <div className="w-full lg:w-1/2 h-64 lg:h-auto">
        <img
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 右侧文字区域 */}
      <div className="w-full lg:w-1/2 bg-[#281B13] text-[#F3E2D4] px-6 py-8 flex flex-col justify-between border-l-4 border-[#FC7023]">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{movie.title}</h2>
          <p className="text-sm text-[#F3E2D4]/80">
            <strong className="text-[#FC7023]">TMDB Score:</strong>{" "}
            {movie.tmdb_rating ?? "N/A"}
          </p>
          <p className="text-sm leading-relaxed text-[#F3E2D4]/90">
            {movie.description || "No description available."}
          </p>
        </div>

        {/* ✅ 如果是已观看电影，展示用户记录 */}
        {isWatched && (
          <div className="mt-6">
            <UserMovieStats
              rating={movie.user_rating}
              liked={movie.liked}
              watchDate={movie.watch_date}
            />
          </div>
        )}

        {/* ✅ 按钮（仅非只读时显示） */}
        {!readOnly && (
          <div className="mt-6 text-right">
            <button
              onClick={onFlip}
              className="px-4 py-2 rounded-lg bg-[#FC7023] text-[#281B13] font-medium hover:bg-[#ff8c3a] transition"
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
