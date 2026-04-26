import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

function CarouselImage({ movie }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSource = movie.backdrop || movie.poster;
  const imageSrc = imageSource && !imageFailed ? imageSource : "/poster.jpg";

  useEffect(() => {
    setImageFailed(false);
  }, [movie.id, movie.tmdb_id, imageSource]);

  return (
    <img
      src={imageSrc}
      alt={movie.title}
      onError={() => setImageFailed(true)}
      className="h-full w-full rounded object-cover"
    />
  );
}

function CarouselStrip({ movies, current, setCurrent, onCardClick }) {
  const total = movies.length;
  const touchStartX = useRef(null);

  const visibleMovies = useMemo(() => {
    if (total === 1) {
      return [{ movie: movies[0], index: 0, position: "center" }];
    }
    if (total === 2) {
      return [
        { movie: movies[current], index: current, position: "center" },
        { movie: movies[(current + 1) % total], index: (current + 1) % total, position: "right" },
      ];
    }
    const previous = (current - 1 + total) % total;
    const next = (current + 1) % total;
    return [
      { movie: movies[previous], index: previous, position: "left" },
      { movie: movies[current], index: current, position: "center" },
      { movie: movies[next], index: next, position: "right" },
    ];
  }, [current, movies, total]);

  const rotateLeft = () => {
    if (total <= 1) return;
    setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const rotateRight = () => {
    if (total <= 1) return;
    setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current !== null) {
      const diff = e.changedTouches[0].clientX - touchStartX.current;
      if (diff > 50) rotateRight();
      else if (diff < -50) rotateLeft();
      touchStartX.current = null;
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden px-12 sm:px-16"
      style={{ overflowY: "hidden", maxHeight: "15rem", height: "15rem" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {total > 1 && (
        <button
          type="button"
          onClick={rotateLeft}
          aria-label="Previous movie"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 hidden h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white shadow-lg ring-1 ring-white/20 transition hover:scale-105 hover:bg-black sm:flex"
        >
          <ChevronLeft size={26} strokeWidth={2.5} />
        </button>
      )}

      {total > 1 && (
        <button
          type="button"
          onClick={rotateRight}
          aria-label="Next movie"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 hidden h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white shadow-lg ring-1 ring-white/20 transition hover:scale-105 hover:bg-black sm:flex"
        >
          <ChevronRight size={26} strokeWidth={2.5} />
        </button>
      )}

      <div className="flex h-full w-full items-center justify-center gap-5 sm:gap-7">
        {visibleMovies.map(({ movie, index, position }) => {
          const isActive = index === current;
          return (
            <motion.div
              layout
              key={movie.tmdb_id || `${movie.title}-${index}`}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className={`flex h-full shrink-0 items-center justify-center ${
                isActive ? "z-10 scale-110 opacity-100" : "scale-95 opacity-65"
              }`}
            >
              <button
                type="button"
                aria-current={isActive ? "true" : undefined}
                className={`relative h-52 w-[18rem] max-w-[28vw] cursor-pointer overflow-hidden rounded-xl shadow-md transition duration-300 hover:scale-[1.04] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#FC7023] ${
                  isActive
                    ? "shadow-[0_14px_35px_rgba(252,112,35,0.22)] ring-2 ring-[#FC7023]/70"
                    : "ring-1 ring-white/5"
                }`}
                style={{
                  backgroundImage: "url('/card.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  padding: "15px",
                }}
                onClick={() => onCardClick?.(movie)}
              >
                <span className="sr-only">
                  {position === "center" ? "Selected recommendation" : "Recommendation"}
                </span>
                <CarouselImage movie={movie} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default CarouselStrip;
