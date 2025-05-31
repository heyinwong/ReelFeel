import { motion } from "framer-motion";
import { useState } from "react";
import { FiRepeat } from "react-icons/fi";

function SearchPanel({
  mode,
  input,
  suggestions,
  onInputChange,
  onSubmit,
  onSwitchMode,
  loading,
  onSelectSuggestion,
}) {
  const [hovering, setHovering] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full pt-4 pb-10 px-4 flex flex-col items-center -mt-12"
    >
      <form
        onSubmit={onSubmit}
        className="bg-[#fdf4e3]/70 backdrop-blur-md border border-[#fc7023]/20 p-6 rounded-xl shadow-lg max-w-3xl w-full flex flex-col sm:flex-row gap-3 relative"
      >
        {/* 左侧按钮 */}
        <button
          type="button"
          onClick={onSwitchMode}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className="w-full sm:w-[130px] h-[48px] bg-[#281B13] text-[#F3E2D4] border border-[#A64816] rounded-md text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2"
        >
          {/* 手机端：图标 + 标签 */}
          <div className="flex flex-col items-center sm:hidden">
            <FiRepeat className="text-xl" />
            <span className="text-[11px] font-medium mt-1">
              {mode === "mood" ? "Roll the Reel" : "Search"}
            </span>
          </div>

          {/* 桌面端：完整文字 + 动画 */}
          <span className="hidden sm:inline">
            {hovering ? (
              <FiRepeat className="text-lg" />
            ) : mode === "mood" ? (
              "Roll the Reel"
            ) : (
              "Search"
            )}
          </span>
        </button>

        {/* 输入框 */}
        <input
          type="text"
          value={input}
          onChange={onInputChange}
          placeholder={
            mode === "mood"
              ? "e.g. Something nostalgic and heartwarming"
              : "e.g. Inception, Interstellar"
          }
          className="flex-1 w-full h-[58px] sm:h-[48px] px-5 text-[17px] sm:text-[16px] text-[#281B13] placeholder:text-[#7a5c4a] bg-white border border-[#E95E1D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E95E1D]/40"
        />

        <button
          type="submit"
          disabled={loading}
          className={`h-[44px] sm:h-[48px] w-full sm:w-[130px] rounded-md text-base font-semibold transition-all shadow flex items-center justify-center ${
            loading
              ? "bg-[#E95E1D]/60 cursor-not-allowed"
              : "bg-[#E95E1D] text-white hover:bg-[#D94F13] hover:scale-105 active:scale-95"
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : mode === "mood" ? (
            "Recommend"
          ) : (
            "Find Movie"
          )}
        </button>

        {/* 搜索建议下拉 */}
        {mode === "search" && suggestions.length > 0 && (
          <ul className="absolute top-full left-0 mt-2 w-full bg-[#1f1f25]/95 border border-[#E95E1D]/30 rounded-xl shadow-xl backdrop-blur-sm z-50 text-white max-h-[240px] overflow-y-auto transition-all duration-300">
            {suggestions.map((movie) => (
              <li
                key={movie.id}
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#E95E1D]/20 cursor-pointer transition-all"
                onClick={() => onSelectSuggestion(movie)}
              >
                {movie.poster && (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-8 h-12 object-cover rounded shadow-sm"
                  />
                )}
                <span className="text-sm font-medium">{movie.title}</span>
              </li>
            ))}
          </ul>
        )}
      </form>
    </motion.div>
  );
}

export default SearchPanel;
