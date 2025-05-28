import { useState } from "react";

function CarouselStrip({ movies, current, setCurrent, onCardClick }) {
  const total = movies.length;

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const prevIndex = (current - 1 + total) % total;
  const nextIndex = (current + 1) % total;
  const visibleMovies = [movies[prevIndex], movies[current], movies[nextIndex]];

  return (
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
  );
}

export default CarouselStrip;
