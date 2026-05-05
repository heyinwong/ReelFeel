import { useEffect, useState } from "react";
import UserMovieStats from "./UserMovieStats";

function MovieModalFront({ movie, onFlip, readOnly }) {
  const [imageFailed, setImageFailed] = useState(false);
  const isWatched = movie.mode === "watched";
  const imageSource = movie.backdrop || movie.poster;
  const imageSrc = imageSource && !imageFailed ? imageSource : "/poster.jpg";

  useEffect(() => {
    setImageFailed(false);
  }, [movie.id, movie.tmdb_id, imageSource]);

  return (
    <div className="absolute inset-0 flex flex-col lg:flex-row bg-white rounded-2xl shadow-lg [backface-visibility:hidden]">
      <div className="w-full lg:w-1/2 h-60 sm:h-72 lg:h-auto">
        <img
          src={imageSrc}
          alt={movie.title}
          onError={() => setImageFailed(true)}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full lg:w-1/2 bg-[#281B13] text-[#F3E2D4] px-4 sm:px-6 py-6 flex flex-col justify-between border-t-4 lg:border-t-0 lg:border-l-4 border-[#FC7023] max-h-[90vh]">
        <div className="flex-grow space-y-3 overflow-hidden">
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

          <div className="text-sm sm:text-base leading-relaxed text-[#F3E2D4]/90 mt-4 max-h-40 overflow-y-auto pr-2">
            {movie.description || "No description available."}
          </div>
        </div>

        {isWatched && (
          <div className="mt-4">
            <UserMovieStats
              rating={movie.user_rating}
              liked={movie.liked}
              watchDate={movie.watch_date}
            />
          </div>
        )}

        {!readOnly && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={onFlip}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#FC7023] text-[#281B13] font-bold hover:bg-[#ff8c3a] transition"
            >
              Add reflection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieModalFront;
