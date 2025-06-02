import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MoodSelector from "./MoodSelector";

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
    <div className="rating rating-md rating-half flex justify-start w-full">
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
      <h3 className="text-2xl font-semibold mb-5 text-center">Your Review</h3>

      <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
        {/* Left Section */}
        <div className="flex flex-col gap-3 w-full lg:w-1/2 pl-6">
          <div className="w-full max-w-xs">
            <label className="block text-lg mb-1 font-semibold">Moods:</label>
            <MoodSelector
              selectedMoods={selectedMoods}
              toggleMood={toggleMood}
            />
          </div>

          <div className="w-full max-w-xs">
            <label className="block text-lg mb-1 font-semibold">
              Watched on:
            </label>
            <DatePicker
              selected={watchDate ? new Date(watchDate) : null}
              onChange={(date) =>
                setWatchDate(date ? date.toISOString().split("T")[0] : "")
              }
              className="bg-[#281B13] border border-[#FC7023]/50 text-[#F3E2D4] rounded w-full px-3 py-2 text-sm"
              placeholderText="Select a date"
              dateFormat="yyyy-MM-dd"
              showPopperArrow={false}
            />
          </div>

          {renderStars()}

          <div className="flex gap-3">
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

        {/* Divider */}
        <div className="hidden lg:block w-[2px] bg-[#FC7023]/50 h-full rounded mx-8" />

        {/* Right Section */}
        <div className="flex flex-col w-full lg:w-1/2 gap-2">
          <label className="text-lg font-semibold">Your Thoughts:</label>
          <textarea
            className="h-40 bg-[#281B13] border border-[#FC7023]/50 text-[#F3E2D4] rounded px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FC7023]"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write what you felt..."
          />
        </div>
      </div>

      {/* Tagline */}
      <div className="mt-6 text-center">
        <p className="text-sm text-[#F3E2D4]/70 italic">
          Every scene leaves a mark. Make yours memorable.
        </p>
      </div>

      {/* Bottom Buttons */}
      <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-[#FC7023]/30">
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
          className="px-6 py-2 rounded-md bg-[#FC7023] text-[#281B13] font-semibold hover:bg-[#ff8c3a] transition hover:scale-[1.05]"
          onClick={onSave}
        >
          {isSaving ? "Saving..." : "Save"}
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
