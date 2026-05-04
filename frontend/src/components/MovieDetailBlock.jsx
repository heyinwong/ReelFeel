import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiLogIn, FiZap } from "react-icons/fi";

function MovieDetailBlock({ movie, user, onAdd, mode }) {
  if (!movie) return null;
  const isDemo = Boolean(user?.is_demo);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-br from-[#FAEFE0] to-[#F3E2D4] text-[#281B13] mt-14 rounded-3xl shadow-[0_8px_24px_rgba(252,112,35,0.15)] px-4 sm:px-10 py-6 sm:py-8 max-w-4xl mx-auto relative overflow-hidden border border-[#FC7023]/30 backdrop-blur-md"
    >
      {/* 标题 */}
      <h3 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-wide text-center break-words overflow-wrap-anywhere">
        {movie.title}
      </h3>

      {/* TMDB评分 */}
      <p className="text-[#FC7023] text-base sm:text-lg font-semibold text-center mb-4 tracking-wider">
        TMDB Rating:{" "}
        {movie.tmdb_rating ? Number(movie.tmdb_rating).toFixed(1) : "N/A"}
      </p>

      {/* 简介 */}
      <p className="text-sm sm:text-base leading-relaxed mb-6 px-1 text-center text-[#3b2c23] break-words overflow-wrap-anywhere">
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
            className="relative bg-[#fdf4ed] border border-dashed border-[#FC7023]/45 rounded-[18px] px-6 pt-6 pb-5 mt-6 mb-8 shadow-sm"
          >
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="absolute -top-3 left-0 bg-[#281B13] text-[#F3E2D4] text-xs font-bold px-3 py-1 rounded-br-xl rounded-tl-lg tracking-wide shadow-md"
            >
              <FiLogIn className="inline-block mr-1 -mt-0.5" />
              Taste Insight Locked
            </motion.div>

            <p className="text-sm sm:text-base text-[#4b3a2f] leading-relaxed mt-2">
              Log in to turn this recommendation into a personal AI taste
              insight based on your ratings, reviews, and watch history.
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
            className="relative bg-[#fdf4ed] border border-dashed border-[#FC7023]/60 rounded-[18px] px-6 pt-6 pb-4 mt-6 mb-8 shadow-sm"
          >
            {/* AI Insight 角标 */}
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="absolute -top-3 left-0 bg-[#FC7023] text-[#281B13] text-xs font-bold px-3 py-1 rounded-br-xl rounded-tl-lg tracking-wide shadow-md"
            >
              <FiZap className="inline-block mr-1 -mt-0.5" />
              AI Insight
            </motion.div>

            {/* 推荐理由内容 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="text-sm sm:text-base italic text-[#4b3a2f] leading-relaxed mt-2"
            >
              {movie.reason}
            </motion.p>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {(movie.taste_match_tags || []).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-[#FC7023]/15 border border-[#FC7023]/30 text-[#4b3a2f]"
                >
                  {tag}
                </span>
              ))}
              {movie.confidence && (
                <span className="text-xs px-2 py-1 rounded-full bg-[#281B13]/10 text-[#4b3a2f]/75">
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
            className="relative bg-[#f5f2ee] border border-dashed border-[#aaa]/40 rounded-[18px] px-6 pt-6 pb-4 mt-6 mb-8 shadow-sm"
          >
            {/* Fallback 角标 */}
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="absolute -top-3 left-0 bg-[#aaa] text-white text-xs font-bold px-3 py-1 rounded-br-xl rounded-tl-lg tracking-wide shadow"
            >
              <FiZap className="inline-block mr-1 -mt-0.5" />
              AI Insight
            </motion.div>

            {/* 提示文字 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="text-sm sm:text-base italic text-[#4a3a30]/70 leading-relaxed mt-2"
            >
              Our AI is still learning your taste. Once you review a few movies,
              personalized insights will appear here.
            </motion.p>
          </motion.div>
        ))}

      {/* 按钮区 */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
        <motion.button
          whileHover={isDemo ? undefined : { scale: 1.05, y: -2 }}
          whileTap={isDemo ? undefined : { scale: 0.97 }}
          disabled={isDemo}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-bold transition-all duration-200 shadow-md text-center ${
            isDemo
              ? "cursor-not-allowed bg-[#281B13]/25 text-[#281B13]/55 shadow-none"
              : "bg-[#FC7023] hover:bg-orange-600 text-white"
          }`}
          onClick={() => !isDemo && onAdd(movie, "watched")}
        >
          + Add to Reel Log
        </motion.button>
        <motion.button
          whileHover={isDemo ? undefined : { scale: 1.05, y: -2 }}
          whileTap={isDemo ? undefined : { scale: 0.97 }}
          disabled={isDemo}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-bold transition-all duration-200 shadow-md text-center ${
            isDemo
              ? "cursor-not-allowed bg-[#281B13]/25 text-[#281B13]/55 shadow-none"
              : "bg-[#FC7023] hover:bg-orange-600 text-white"
          }`}
          onClick={() => !isDemo && onAdd(movie, "waiting")}
        >
          + Add to Watchlist
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
