import { useState } from "react";
import { motion } from "framer-motion";

const moodOptions = [
  { emoji: "😭", tag: "Moved" },
  { emoji: "😂", tag: "Hilarious" },
  { emoji: "😱", tag: "Shocking" },
  { emoji: "😢", tag: "Sad" },
  { emoji: "🤔", tag: "Thoughtful" },
  { emoji: "🧠", tag: "Smart" },
  { emoji: "💖", tag: "Heartwarming" },
  { emoji: "💤", tag: "Boring" },
  { emoji: "❤️‍🔥", tag: "Intense" },
  { emoji: "✨", tag: "Beautiful" },
];

function MovieModal({ movie, onClose, onRate, onLike, onReview }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(null);
  const [localRating, setLocalRating] = useState(movie?.user_rating || 0);
  const [localLiked, setLocalLiked] = useState(movie?.liked || false);
  const [review, setReview] = useState(movie?.review || "");
  const [selectedMoods, setSelectedMoods] = useState([]);

  if (!movie) return null;

  const handleRate = (val) => {
    setLocalRating(val);
    onRate?.({ ...movie, user_rating: val });
  };

  const handleLike = () => {
    const newLiked = !localLiked;
    setLocalLiked(newLiked);
    onLike?.({ ...movie, liked: newLiked });
  };

  const handleReviewSave = () => {
    onReview?.({ ...movie, review, moods: selectedMoods });
  };

  const toggleMood = (tag) => {
    setSelectedMoods((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const renderStars = () => {
    const current = hoveredRating ?? localRating;
    return (
      <div className="rating rating-md rating-half">
        {[1, 2, 3, 4, 5].flatMap((i) => {
          const halfVal = i * 2 - 1;
          const fullVal = i * 2;
          return [
            <input
              key={`half-${i}`}
              type="radio"
              name={`rating-${movie.title}`}
              className="mask mask-star-2 mask-half-1 bg-yellow-400"
              aria-label={`${i - 0.5} star`}
              checked={current === halfVal}
              onMouseEnter={() => setHoveredRating(halfVal)}
              onMouseLeave={() => setHoveredRating(null)}
              onClick={() => handleRate(halfVal)}
              readOnly
            />,
            <input
              key={`full-${i}`}
              type="radio"
              name={`rating-${movie.title}`}
              className="mask mask-star-2 mask-half-2 bg-yellow-400"
              aria-label={`${i} star`}
              checked={current === fullVal}
              onMouseEnter={() => setHoveredRating(fullVal)}
              onMouseLeave={() => setHoveredRating(null)}
              onClick={() => handleRate(fullVal)}
              readOnly
            />,
          ];
        })}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-[90%] lg:w-[900px] max-h-[90vh] overflow-y-auto rounded-xl shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className="w-full min-h-[500px] relative [transform-style:preserve-3d]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Front */}
          <div className="card lg:card-side bg-base-100 p-6 [backface-visibility:hidden] absolute inset-0 rounded-xl">
            <figure className="w-full lg:w-1/2 max-h-[400px]">
              <img
                src={movie.backdrop || movie.poster}
                alt={movie.title}
                className="object-cover w-full h-full rounded-lg"
              />
            </figure>
            <div className="card-body w-full lg:w-1/2 p-4 space-y-3">
              <h2 className="text-xl font-bold">{movie.title}</h2>
              <p className="text-sm text-gray-600">
                <strong>TMDB Score:</strong> {movie.tmdb_rating ?? "N/A"}
              </p>
              <p className="text-sm text-gray-700">
                {movie.description || "No description available."}
              </p>
              <div className="card-actions justify-end mt-4">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsFlipped(true)}
                >
                  Write your thoughts →
                </button>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 bg-white p-6 rounded-xl shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Your Review
            </h3>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {moodOptions.map(({ emoji, tag }) => (
                <button
                  key={tag}
                  onClick={() => toggleMood(tag)}
                  className={`px-3 py-1 rounded-full border text-sm transition ${
                    selectedMoods.includes(tag)
                      ? "bg-blue-100 border-blue-300 text-blue-800"
                      : "bg-gray-100 border-gray-300 text-gray-700"
                  }`}
                >
                  {emoji} {tag}
                </button>
              ))}
            </div>
            <textarea
              className="w-full h-40 border rounded p-2 text-sm mb-4"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write what you felt..."
            />
            <div className="flex flex-col gap-4 items-center">
              <div className="flex gap-3 items-center">
                {renderStars()}
                <button
                  className={`btn btn-sm ${
                    localLiked ? "btn-error" : "btn-outline"
                  }`}
                  onClick={handleLike}
                >
                  {localLiked ? "♥ Liked" : "♡ Like"}
                </button>
              </div>
              <div className="flex justify-between w-full">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setIsFlipped(false)}
                >
                  ← Back to Details
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleReviewSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default MovieModal;
