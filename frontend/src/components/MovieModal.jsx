import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import MovieModalFront from "./MovieModalFront";
import MovieModalBack from "./MovieModalBack";

function MovieModal({
  movie,
  onClose,
  onReview,
  onDelete,
  readOnly = false,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [localRating, setLocalRating] = useState(0);
  const [localLiked, setLocalLiked] = useState(false);
  const [review, setReview] = useState("");
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [watchDate, setWatchDate] = useState("");
  const [localDisliked, setLocalDisliked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (movie) {
      setLocalRating(movie.user_rating || 0);
      setLocalLiked(movie.liked || false);
      setReview(movie.review || "");
      setSelectedMoods(normalizeMoods(movie.moods));
      setWatchDate(movie.watch_date || "");
      setLocalDisliked(movie.disliked || false);
    }
  }, [movie]);

  if (!movie) return null;

  const isFromWaiting = movie.mode === "waiting";

  const handleReviewSave = async () => {
    const hasData =
      localRating > 0 ||
      localLiked ||
      localDisliked || // ✅ 加上这个
      review.trim() !== "" ||
      selectedMoods.length > 0;

    if (!hasData) {
      toast.error("Nothing to save.");
      return;
    }

    try {
      setIsSaving(true); // start loading
      await onReview?.({
        ...movie,
        user_rating: localRating,
        liked: localLiked,
        disliked: localDisliked,
        review,
        moods: selectedMoods,
        watch_date: watchDate,
        ...(isFromWaiting ? { fromWaiting: true } : {}),
      });
      toast.success("Review saved!");
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save.");
    } finally {
      setIsSaving(false); // end loading
    }
  };

  const toggleMood = (tag) => {
    setSelectedMoods((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-3 backdrop-blur-sm sm:px-0"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[95vw] sm:max-w-[900px] max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-2xl border border-[#FC7023]/24 shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close movie details"
          onClick={onClose}
          className="absolute right-3 top-3 z-[60] flex h-9 w-9 items-center justify-center rounded-xl border border-[#F3E2D4]/20 bg-black/60 text-[#F3E2D4] shadow-lg backdrop-blur transition hover:bg-[#FC7023] hover:text-[#281B13]"
        >
          <X size={18} />
        </button>
        <motion.div
          className="w-full min-h-[500px] relative [transform-style:preserve-3d]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
        >
          <MovieModalFront
            movie={movie}
            onFlip={() => setIsFlipped(true)}
            readOnly={readOnly}
          />

          {!readOnly && (
            <MovieModalBack
              movie={movie}
              onClose={onClose}
              onDelete={onDelete}
              onFlipBack={() => setIsFlipped(false)}
              onSave={handleReviewSave}
              localRating={localRating}
              setLocalRating={setLocalRating}
              localLiked={localLiked}
              setLocalLiked={setLocalLiked}
              localDisliked={localDisliked}
              setLocalDisliked={setLocalDisliked}
              review={review}
              setReview={setReview}
              selectedMoods={selectedMoods}
              toggleMood={toggleMood}
              watchDate={watchDate}
              setWatchDate={setWatchDate}
              isSaving={isSaving}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

function normalizeMoods(moods) {
  if (Array.isArray(moods)) return moods;
  if (typeof moods === "string") {
    return moods
      .split(",")
      .map((mood) => mood.trim())
      .filter(Boolean);
  }
  return [];
}

export default MovieModal;
