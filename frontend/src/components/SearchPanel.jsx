import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";

const moodSamples = [
  "quiet emotional sci-fi",
  "warm family animation",
  "bittersweet city romance",
];

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
  const applySample = (value) => {
    onInputChange({ target: { value } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full pt-4 pb-10 px-4 flex flex-col items-center -mt-12"
    >
      <form
        onSubmit={onSubmit}
        className="bg-[#fdf4e3]/82 backdrop-blur-md border border-[#fc7023]/25 p-4 sm:p-5 rounded-2xl shadow-[0_20px_55px_rgba(0,0,0,0.25)] max-w-4xl w-full flex flex-col gap-4 relative"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid grid-cols-2 rounded-full bg-[#281B13]/10 p-1 text-sm font-black text-[#281B13] sm:w-[250px]">
            <button
              type="button"
              onClick={mode === "mood" ? undefined : onSwitchMode}
              className={`flex h-10 items-center justify-center gap-2 rounded-full transition ${
                mode === "mood"
                  ? "bg-[#281B13] text-[#F3E2D4] shadow"
                  : "text-[#5c412f] hover:bg-white/45"
              }`}
            >
              <Sparkles size={16} />
              Mood
            </button>
            <button
              type="button"
              onClick={mode === "search" ? undefined : onSwitchMode}
              className={`flex h-10 items-center justify-center gap-2 rounded-full transition ${
                mode === "search"
                  ? "bg-[#281B13] text-[#F3E2D4] shadow"
                  : "text-[#5c412f] hover:bg-white/45"
              }`}
            >
              <Search size={16} />
              Title
            </button>
          </div>

          <div className="relative flex flex-1 flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={input}
              onChange={onInputChange}
              placeholder={
                mode === "mood"
                  ? "Describe the feeling you want tonight"
                  : "Search a movie title"
              }
              className="h-[54px] w-full flex-1 rounded-xl border border-[#E95E1D]/70 bg-white px-5 text-[17px] text-[#281B13] placeholder:text-[#7a5c4a] focus:outline-none focus:ring-2 focus:ring-[#E95E1D]/40"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`h-[54px] w-full rounded-xl text-base font-black transition-all shadow sm:w-[150px] flex items-center justify-center ${
                loading || !input.trim()
                  ? "bg-[#E95E1D]/45 cursor-not-allowed text-white"
                  : "bg-[#E95E1D] text-white hover:bg-[#D94F13] hover:scale-[1.02] active:scale-95"
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
          </div>
        </div>

        {mode === "mood" && (
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span className="font-bold text-[#6f4b36]">Try:</span>
            {moodSamples.map((sample) => (
              <button
                type="button"
                key={sample}
                onClick={() => applySample(sample)}
                className="rounded-full border border-[#FC7023]/25 bg-white/55 px-3 py-1.5 font-semibold text-[#6b4731] transition hover:border-[#FC7023] hover:bg-white"
              >
                {sample}
              </button>
            ))}
          </div>
        )}

        {/* 搜索建议 */}
        {mode === "search" && suggestions.length > 0 && (
          <ul className="w-full bg-[#1f1f25]/95 border border-[#E95E1D]/30 rounded-xl shadow-xl backdrop-blur-sm text-white max-h-[260px] overflow-y-auto transition-all duration-300">
            {suggestions.map((movie) => (
              <li
                key={movie.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#E95E1D]/20 cursor-pointer transition-all"
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
