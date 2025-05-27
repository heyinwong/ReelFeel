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
        className="bg-[#fdf4e3]/70 backdrop-blur-md border border-[#fc7023]/20 p-6 rounded-xl shadow-lg max-w-3xl w-full flex gap-3 relative"
      >
        {/* 左侧按钮 */}
        <button
          type="button"
          onClick={onSwitchMode}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className="w-[130px] h-[48px] bg-[#281B13] text-[#F3E2D4] border border-[#A64816] rounded-md text-base font-semibold hover:bg-[#3a251a] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
        >
          {hovering ? (
            <FiRepeat className="text-lg" />
          ) : mode === "mood" ? (
            "Roll the Reel"
          ) : (
            "Search"
          )}
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
          className="flex-1 h-[48px] px-4 bg-white text-[#281B13] placeholder:text-[#7a5c4a] border border-[#E95E1D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E95E1D]/40 text-base"
        />

        {/* 右侧按钮 */}
        <button
          type="submit"
          className="w-[130px] h-[48px] bg-[#E95E1D] text-white rounded-md text-base font-semibold hover:bg-[#D94F13] active:scale-95 transition-all shadow"
        >
          {mode === "mood" ? "Recommend" : "Find Movie"}
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
