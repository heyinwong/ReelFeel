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
  review,
  setReview,
  selectedMoods,
  toggleMood,
  watchDate,
  setWatchDate,
}) {
  const moodOptions = [
    { emoji: "😭", tag: "Moved" },
    { emoji: "😂", tag: "Hilarious" },
    { emoji: "🤔", tag: "Thoughtful" },
    { emoji: "💖", tag: "Heartwarming" },
    { emoji: "✨", tag: "Beautiful" },
  ];
  const isFromWaiting = movie.mode === "waiting";

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
            className="mask mask-star-2 mask-half-1 bg-yellow-400"
            aria-label={`${i - 0.5} star`}
            checked={localRating === halfVal}
            onClick={() => setLocalRating(halfVal)}
            readOnly
          />,
          <input
            key={`full-${i}`}
            type="radio"
            name={`rating-${movie.title}`}
            className="mask mask-star-2 mask-half-2 bg-yellow-400"
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
    <div className="absolute inset-0 bg-[#281B13] text-[#F3E2D4] p-4 sm:p-6 overflow-y-auto max-h-[90vh] rounded-xl shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
      <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-center">
        Your Review
      </h3>

      {/* Mood tags */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-5">
        {moodOptions.map(({ emoji, tag }) => (
          <button
            key={tag}
            onClick={() => toggleMood(tag)}
            className={`px-3 sm:px-4 py-1.5 rounded-full border text-sm font-medium transition-all ${
              selectedMoods.includes(tag)
                ? "bg-[#FC7023] text-[#281B13] border-[#FC7023]"
                : "border-[#FC7023]/50 text-[#F3E2D4]/80 hover:border-[#FC7023]"
            }`}
          >
            {emoji} {tag}
          </button>
        ))}
      </div>

      {/* Watch date */}
      <div className="mb-4">
        <label className="block text-sm mb-1 font-semibold text-[#F3E2D4]">
          Watched on:
        </label>
        <input
          type="date"
          value={watchDate}
          onChange={(e) => setWatchDate(e.target.value)}
          className="bg-[#281B13] border border-[#FC7023]/50 text-[#F3E2D4] rounded w-full px-3 py-2 text-sm"
        />
      </div>

      {/* Review textarea */}
      <textarea
        className="w-full h-36 bg-[#281B13] border border-[#FC7023]/50 text-[#F3E2D4] rounded px-3 py-2 text-sm mb-6 resize-none"
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Write what you felt..."
      />

      {/* Rating + Like */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        {renderStars()}
        <button
          className={`px-4 py-1.5 rounded-md text-sm font-medium shadow ${
            localLiked
              ? "bg-[#FC7023] text-[#281B13]"
              : "border border-[#FC7023] text-[#FC7023]"
          }`}
          onClick={() => setLocalLiked((prev) => !prev)}
        >
          {localLiked ? "♥ Liked" : "♡ Like"}
        </button>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 mt-4 text-sm">
        {onDelete && (
          <button
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
            onClick={() => {
              onDelete(movie);
              onClose();
            }}
          >
            Delete
          </button>
        )}
        <button
          className="w-full sm:w-auto px-4 py-2 rounded-md bg-[#FC7023] text-[#281B13] font-semibold hover:bg-[#ff8c3a] transition"
          onClick={onSave}
        >
          Save
        </button>
        {!isFromWaiting && (
          <button
            className="w-full sm:w-auto px-4 py-2 rounded-md border border-[#F3E2D4]/50 text-[#F3E2D4] hover:bg-[#F3E2D4]/10 transition"
            onClick={onFlipBack}
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

export default MovieModalBack;
