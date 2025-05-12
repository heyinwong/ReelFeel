import { useState } from "react";

function MovieCard({ movie, onClick }) {
  const [hovered, setHovered] = useState(false);
  const { title, poster, user_rating, liked } = movie;

  return (
    <div
      className="relative w-52 flex flex-col items-center transform transition-transform duration-200 hover:scale-105 cursor-pointer"
      onClick={() => onClick && onClick(movie)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Film frame */}
      <div
        className="relative w-48 h-72 bg-no-repeat bg-center bg-contain drop-shadow-lg"
        style={{ backgroundImage: "url('/poster.jpg')" }}
      >
        <img
          src={poster}
          alt={title}
          className="absolute top-[3%] left-[6%] w-[88%] h-[94%] object-cover rounded"
        />
        {hovered && (
          <div className="absolute inset-x-1 bottom-1 text-xs text-white bg-black/60 rounded px-2 py-1">
            <div className="flex justify-between mb-1">
              <span>{title}</span>
              {liked == true && (
                <svg
                  className="w-4 h-4 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5c0-2 1.5-3.5 3.5-3.5 1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 3.78-3.4 6.86-8.55 11.54z" />
                </svg>
              )}
            </div>
            <span>{user_rating ? `⭐: ${user_rating / 2}` : "Not Rated"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieCard;
