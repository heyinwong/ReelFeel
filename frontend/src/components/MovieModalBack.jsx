import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MoodSelector from "./MoodSelector";
import { motion, AnimatePresence } from "framer-motion";

function MovieModalBack({
  movie,
  onClose,
  onDelete,
  onFlipBack,
  onSave,
  localRating,
  setLocalRating,
  localLiked,
  setLocalLiked,
  localDisliked,
  setLocalDisliked,
  review,
  setReview,
  selectedMoods,
  toggleMood,
  watchDate,
  setWatchDate,
  isSaving,
}) {
  const renderStars = () => (
    <div className="rating rating-md rating-half flex justify-center">
      {[1, 2, 3, 4, 5].flatMap((i) => {
        const halfVal = i * 2 - 1;
        const fullVal = i * 2;
        return [
          <input
            key={`half-${i}`}
            type="radio"
            name={`rating-${movie.title}`}
            className="mask mask-star-2 mask-half-1 bg-yellow-400 hover:scale-110 transition-transform duration-150"
            aria-label={`${i - 0.5} star`}
            checked={localRating === halfVal}
            onClick={() => setLocalRating(halfVal)}
            readOnly
          />,
          <input
            key={`full-${i}`}
            type="radio"
            name={`rating-${movie.title}`}
            className="mask mask-star-2 mask-half-2 bg-yellow-400 hover:scale-110 transition-transform duration-150"
            aria-label={`${i} star`}
            checked={localRating === fullVal}
            onClick={() => setLocalRating(fullVal)}
            readOnly
          />,
        ];
      })}
    </div>
  );

  return (
    <div className="absolute inset-0 bg-[#281B13] text-[#F3E2D4] p-6 overflow-y-auto max-h-[90vh] rounded-xl shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
      <h3 className="text-2xl font-semibold mb-6 text-center">
        Your Review on{" "}
        <span className="italic text-[#FC7023]">{movie.title}</span>
      </h3>

      {/* Thoughts */}
      <div className="px-6 mb-6">
        <textarea
          className="w-full h-36 bg-[#281B13] border border-[#FC7023]/50 text-[#F3E2D4] rounded px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FC7023]"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write down your thoughts: What stayed with you, touched you, or made you think..."
        />
      </div>

      {/* Mood, Watched On, Like/Dislike */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 px-6 mb-6">
        {/* Mood Selector */}
        <div className="w-full flex justify-center sm:justify-start">
          <MoodSelector selectedMoods={selectedMoods} toggleMood={toggleMood} />
        </div>

        {/* Watched Date */}
        <div className="w-full flex justify-center sm:justify-start text-sm text-[#F3E2D4]/80 items-center gap-2 text-center">
          <span className="whitespace-nowrap">Watched on:</span>
          <DatePicker
            selected={watchDate ? new Date(watchDate) : null}
            onChange={(date) =>
              setWatchDate(date ? date.toISOString().split("T")[0] : "")
            }
            className="bg-[#281B13] border border-[#FC7023]/50 text-[#F3E2D4] rounded px-3 py-2 text-sm w-[160px]"
            placeholderText="Select a date"
            dateFormat="yyyy-MM-dd"
            showPopperArrow={false}
          />
        </div>

        {/* Like / Dislike Buttons */}
        <div className="w-full flex justify-center sm:justify-end gap-3">
          <button
            className={`px-4 py-1.5 rounded-full text-sm font-medium shadow transition-transform duration-200 hover:scale-105 ${
              localLiked
                ? "bg-[#FC7023] text-[#281B13]"
                : "border border-[#FC7023] text-[#FC7023] hover:bg-[#FC7023]/10"
            }`}
            onClick={() => {
              const newLiked = !localLiked;
              setLocalLiked(newLiked);
              if (newLiked) setLocalDisliked(false);
            }}
          >
            {localLiked ? "♥ Liked" : "♡ Like"}
          </button>

          <button
            className={`px-4 py-1.5 rounded-full text-sm font-medium shadow transition-transform duration-200 hover:scale-105 ${
              localDisliked
                ? "bg-red-600 text-white"
                : "border border-red-600 text-red-600 hover:bg-red-600/10"
            }`}
            onClick={() => {
              const newDisliked = !localDisliked;
              setLocalDisliked(newDisliked);
              if (newDisliked) setLocalLiked(false);
            }}
          >
            {localDisliked ? "👎 Disliked" : "👎 Dislike"}
          </button>
        </div>
      </div>

      {/* Rating */}
      <div className="flex justify-center mb-4">{renderStars()}</div>

      {/* Tagline Divider */}
      <div className="mt-6 text-center border-t border-dotted border-[#FC7023]/30 pt-4">
        <p className="text-sm text-[#F3E2D4]/70 italic">
          Every scene leaves a mark. Make yours memorable.
        </p>
      </div>

      {/* Bottom Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        {onDelete && (
          <button
            className="px-6 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition hover:scale-[1.05]"
            onClick={() => {
              onDelete(movie);
              onClose();
            }}
          >
            Delete
          </button>
        )}
        <button
          className="px-6 py-2 rounded-md bg-[#FC7023] text-[#281B13] font-semibold hover:bg-[#ff8c3a] transition hover:scale-[1.05] flex items-center gap-2"
          onClick={onSave}
          disabled={isSaving}
        >
          <AnimatePresence mode="wait">
            {isSaving ? (
              <motion.div
                key="spinner"
                className="h-4 w-4 border-2 border-[#281B13] border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                initial={{ rotate: 0 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 0.6,
                  ease: "linear",
                }}
              />
            ) : (
              <motion.span
                key="save-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Save
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button
          className="px-6 py-2 rounded-md border border-[#F3E2D4]/50 text-[#F3E2D4] hover:bg-[#F3E2D4]/10 transition hover:scale-[1.05]"
          onClick={onFlipBack}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

export default MovieModalBack;
