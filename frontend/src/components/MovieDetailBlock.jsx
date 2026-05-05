import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiLogIn, FiZap } from "react-icons/fi";
import { Check, Plus } from "lucide-react";

function MovieDetailBlock({ movie, user, onAdd, mode }) {
  if (!movie) return null;
  const isDemo = Boolean(user?.is_demo);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-8 max-w-4xl mx-auto overflow-hidden rounded-2xl border border-[#FC7023]/24 bg-[#F7E9D8] px-5 py-6 text-[#281B13] shadow-[0_18px_55px_rgba(0,0,0,0.2)] sm:px-8"
    >
      <div className="mb-5 flex flex-col gap-3 border-b border-[#281B13]/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#B64A17]">
            Selected title
          </p>
          <h3 className="text-2xl sm:text-3xl font-black leading-tight tracking-normal break-words overflow-wrap-anywhere">
            {movie.title}
          </h3>
        </div>
        <div className="w-fit rounded-xl border border-[#FC7023]/28 bg-[#FC7023]/10 px-3 py-2 text-left sm:text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8E3A12]/70">
            TMDB score
          </p>
          <p className="text-xl font-black leading-none text-[#FC7023]">
            {movie.tmdb_rating ? Number(movie.tmdb_rating).toFixed(1) : "N/A"}
          </p>
        </div>
      </div>

      <p className="mb-5 max-w-3xl text-sm sm:text-base leading-relaxed text-[#3b2c23]/92 break-words overflow-wrap-anywhere">
        {movie.description}
      </p>

      {mode === "mood" &&
        (!user ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 80,
              damping: 12,
              delay: 0.2,
            }}
            className="relative border-l-4 border-[#FC7023] bg-white/50 px-5 py-4 mt-5 mb-6 shadow-sm"
          >
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#8E3A12]"
            >
              <FiLogIn />
              Personal rationale locked
            </motion.div>

            <p className="text-sm sm:text-base text-[#4b3a2f] leading-relaxed">
              Log in to rerank recommendations against your own ratings,
              reviews, moods, and watch history.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-[#FC7023] hover:text-orange-600"
            >
              <FiLogIn />
              Log in for personal insight
            </Link>
          </motion.div>
        ) : movie.reason && movie.reason.trim() !== "" ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 80,
              damping: 12,
              delay: 0.3,
            }}
            className="relative border-l-4 border-[#FC7023] bg-white/52 px-5 py-4 mt-5 mb-6 shadow-sm"
          >
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#8E3A12]"
            >
              <FiZap />
              Taste rationale
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="text-sm sm:text-base text-[#4b3a2f] leading-relaxed"
            >
              {movie.reason}
            </motion.p>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {(movie.taste_match_tags || []).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-[#FC7023]/13 border border-[#FC7023]/24 text-[#4b3a2f]"
                >
                  {tag.replaceAll("_", " ")}
                </span>
              ))}
              {movie.confidence && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#281B13]/8 text-[#4b3a2f]/72">
                  {movie.confidence} confidence
                </span>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 80,
              damping: 12,
              delay: 0.3,
            }}
            className="relative border-l-4 border-[#9C8A7D] bg-white/42 px-5 py-4 mt-5 mb-6 shadow-sm"
          >
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#5f5047]/80"
            >
              <FiZap />
              Taste rationale
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="text-sm sm:text-base text-[#4a3a30]/72 leading-relaxed"
            >
              This result came from the movie candidate pool. Add reviews to
              give Mood mode enough profile signals for a personal rerank.
            </motion.p>
          </motion.div>
        ))}

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
        <motion.button
          whileHover={isDemo ? undefined : { scale: 1.02, y: -1 }}
          whileTap={isDemo ? undefined : { scale: 0.97 }}
          disabled={isDemo}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-bold transition-all duration-200 sm:w-auto ${
            isDemo
              ? "cursor-not-allowed bg-[#281B13]/18 text-[#281B13]/48"
              : "bg-[#281B13] text-[#F3E2D4] shadow-md hover:bg-[#3a281d]"
          }`}
          onClick={() => !isDemo && onAdd(movie, "watched")}
        >
          {isDemo ? <Check size={16} /> : <Plus size={16} />}
          Add to Reel Log
        </motion.button>
        <motion.button
          whileHover={isDemo ? undefined : { scale: 1.02, y: -1 }}
          whileTap={isDemo ? undefined : { scale: 0.97 }}
          disabled={isDemo}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-bold transition-all duration-200 sm:w-auto ${
            isDemo
              ? "cursor-not-allowed bg-[#281B13]/18 text-[#281B13]/48"
              : "border border-[#281B13]/20 bg-white/45 text-[#281B13] shadow-sm hover:bg-white/70"
          }`}
          onClick={() => !isDemo && onAdd(movie, "waiting")}
        >
          {isDemo ? <Check size={16} /> : <Plus size={16} />}
          Add to Watchlist
        </motion.button>
      </div>
      {isDemo && (
        <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#281B13]/55">
          Demo account is read-only
        </p>
      )}
    </motion.div>
  );
}

export default MovieDetailBlock;
