import { FaStar, FaHeart, FaRegCalendarAlt } from "react-icons/fa";

function UserMovieStats({ rating, liked, watchDate }) {
  const hasRating = rating > 0;
  const hasLiked = liked === 1 || liked === true;
  const hasDate = !!watchDate;

  if (!hasRating && !hasLiked && !hasDate) return null;

  return (
    <div className="mt-6 pt-4 space-y-2 border-t border-[#FC7023]/40 text-sm text-[#F3E2D4]">
      {hasRating && (
        <div className="flex items-center gap-2">
          <FaStar className="text-yellow-400" />
          <span>{(rating / 2).toFixed(1)} / 5</span>
        </div>
      )}
      {hasLiked && (
        <div className="flex items-center gap-2">
          <FaHeart className="text-[#FC7023]" />
          <span>Liked</span>
        </div>
      )}
      {hasDate && (
        <div className="flex items-center gap-2">
          <FaRegCalendarAlt className="text-[#FC7023]" />
          <span>{watchDate}</span>
        </div>
      )}
    </div>
  );
}

export default UserMovieStats;
