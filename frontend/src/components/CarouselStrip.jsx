import { useRef, useEffect } from "react";

function CarouselStrip({ movies, current, setCurrent, onCardClick }) {
  const total = movies.length;
  const trackRef = useRef(null);
  const touchStartX = useRef(null);

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current !== null) {
      const diff = e.changedTouches[0].clientX - touchStartX.current;
      if (diff > 50) {
        handlePrev();
      } else if (diff < -50) {
        handleNext();
      }
      touchStartX.current = null;
    }
  };

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transition =
        "transform 400ms cubic-bezier(0.5, 0, 0.3, 1)";
      trackRef.current.style.transform = `translateX(-${current * 100}%)`;
    }
  }, [current]);

  return (
    <div
      className="relative w-full overflow-hidden h-60"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 左按钮 */}
      <button
        onClick={handlePrev}
        className="absolute left-1/2 -translate-x-[240px] top-1/2 -translate-y-1/2 z-10 text-xl text-white bg-black bg-opacity-30 hover:bg-opacity-60 hover:scale-105 rounded-full px-2 sm:px-3 py-1 transition-all"
      >
        ←
      </button>

      {/* 右按钮 */}
      <button
        onClick={handleNext}
        className="absolute left-1/2 translate-x-[240px] top-1/2 -translate-y-1/2 z-10 text-xl text-white bg-black bg-opacity-30 hover:bg-opacity-60 hover:scale-105 rounded-full px-2 sm:px-3 py-1 transition-all"
      >
        →
      </button>

      {/* 轮播轨道 */}
      <div className="w-full h-full flex items-center justify-center">
        <div
          ref={trackRef}
          className="flex w-full h-full"
          style={{ width: `${movies.length * 100}%` }}
        >
          {movies.map((movie, idx) => {
            const isCenter = idx === current;
            return (
              <div
                key={movie.title + idx}
                className={`transition-all duration-300 flex-shrink-0 w-full h-full px-2 flex justify-center items-center ${
                  isCenter ? "scale-105 z-10" : "scale-95 opacity-60"
                }`}
              >
                <div
                  className="relative w-80 h-52 rounded-xl overflow-hidden shadow-md cursor-pointer hover:scale-[1.08] hover:shadow-2xl transition-all duration-300"
                  style={{
                    backgroundImage: "url('/card.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    padding: "15px",
                  }}
                  onClick={() => onCardClick?.(movie)}
                >
                  <img
                    src={movie.backdrop}
                    alt={movie.title}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CarouselStrip;
