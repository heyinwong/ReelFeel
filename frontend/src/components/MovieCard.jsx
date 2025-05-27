import { useState } from "react";

function MovieCard({ movie, onClick }) {
  const [hovered, setHovered] = useState(false);
  const { title, poster, user_rating, liked, mode } = movie;

  return (
    <div
      className="relative w-52 flex flex-col items-center overflow-hidden transform transition-transform duration-200 hover:scale-105 cursor-pointer"
      onClick={() => onClick && onClick(movie)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ willChange: "transform" }}
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
          <div className="absolute bottom-1 left-1 right-1 bg-[#281B13]/90 text-[#F3E2D4] backdrop-blur-sm rounded-lg px-3 py-2 text-sm shadow-md space-y-1 transition-opacity duration-200 overflow-hidden">
            {/* 标题 */}
            <div className="leading-snug font-medium break-words max-h-[3.6rem] overflow-hidden">
              {title}
            </div>

            {/* 仅当 mode !== "waiting" 时显示评分和喜欢 */}
            {mode !== "waiting" && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-yellow-400">⭐</span>
                <span>{user_rating ? user_rating / 2 : "Not Rated"}</span>

                {liked === 1 && (
                  <svg
                    className="w-4 h-4 text-[#FC7023] ml-auto shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5c0-2 1.5-3.5 3.5-3.5 1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 3.78-3.4 6.86-8.55 11.54z" />
                  </svg>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieCard;
