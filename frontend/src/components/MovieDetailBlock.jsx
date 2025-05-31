import { motion } from "framer-motion";
import { FiZap } from "react-icons/fi"; // AI insight 图标

function MovieDetailBlock({ movie, onAdd }) {
  if (!movie) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-br from-[#FAEFE0] to-[#F3E2D4] text-[#281B13] mt-14 rounded-3xl shadow-[0_8px_24px_rgba(252,112,35,0.15)] px-4 sm:px-10 py-6 sm:py-8 max-w-4xl mx-auto relative overflow-hidden border border-[#FC7023]/30 backdrop-blur-md"
    >
      {/* 背景点缀纹理 */}
      <div className="absolute inset-0 opacity-5 bg-[url('/film-texture.png')] bg-repeat pointer-events-none" />

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

      {/* AI推荐理由 */}
      {movie.reason && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-[#fff3e6] border-l-4 border-[#FC7023] p-4 mb-6 rounded group hover:bg-[#ffeede] hover:shadow-inner transition-all duration-300"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FC7023] mb-1">
            <FiZap className="text-sm" />
            AI Insight
          </div>
          <p className="text-sm italic text-[#4a3a30] leading-snug break-words overflow-wrap-anywhere">
            {movie.reason}
          </p>
        </motion.div>
      )}

      {/* 按钮区 */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto bg-[#FC7023] hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold transition-all duration-200 shadow-md text-center"
          onClick={() => onAdd(movie, "watched")}
        >
          + Add to Reel Log
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto bg-[#FC7023] hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold transition-all duration-200 shadow-md text-center"
          onClick={() => onAdd(movie, "waiting")}
        >
          + Add to Watchlist
        </motion.button>
      </div>
    </motion.div>
  );
}

export default MovieDetailBlock;
