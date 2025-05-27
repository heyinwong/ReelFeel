import { motion } from "framer-motion";

function SearchPanel({
  mode,
  input,
  suggestions,
  onInputChange,
  onSubmit,
  onSwitchMode,
  onSelectSuggestion,
}) {
  return (
    <div className="w-full bg-[#281B13] py-10 px-4 flex flex-col items-center">
      {/* Slogan and Subtext */}
      <div className="text-center mb-6">
        <motion.h1
          key={mode}
          className="text-4xl font-extrabold mb-2 tracking-wide text-[#F3E2D4] drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4 }}
        >
          {mode === "mood"
            ? "Your taste, your reel."
            : "Looking for something?"}
        </motion.h1>
        <motion.p
          key={mode + "-desc"}
          className="text-[#F3E2D4] text-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
        >
          {mode === "mood"
            ? "An AI-crafted film pick that suits your taste."
            : "Search any film you have in mind."}
        </motion.p>
      </div>

      {/* Input Form */}
      <form
        onSubmit={onSubmit}
        className="bg-[#F3E2D4] p-6 rounded-xl shadow-lg max-w-3xl w-full flex gap-3 relative"
      >
        <button
          type="button"
          onClick={onSwitchMode}
          className="w-[130px] h-[48px] bg-[#281B13] text-[#F3E2D4] rounded-md text-base font-semibold hover:bg-[#3d2b20] transition"
        >
          {mode === "mood" ? "Roll the Reel" : "Search"}
        </button>

        <input
          type="text"
          value={input}
          onChange={onInputChange}
          placeholder={
            mode === "mood"
              ? "e.g. Something nostalgic and heartwarming"
              : "e.g. Inception, Interstellar"
          }
          className="flex-1 h-[48px] px-4 bg-white text-[#281B13] placeholder-gray-500 border border-[#FC7023] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FC7023] text-base"
        />

        <button
          type="submit"
          className="w-[130px] h-[48px] bg-[#FC7023] text-white rounded-md text-base font-semibold hover:bg-orange-500 active:scale-95 transition-all shadow"
        >
          {mode === "mood" ? "Recommend" : "Find Movie"}
        </button>

        {/* Suggestion Dropdown */}
        {mode === "search" && suggestions.length > 0 && (
          <ul className="absolute top-full left-0 mt-2 w-full bg-[#303642] border border-white/10 rounded-md shadow z-50 text-white max-h-[200px] overflow-y-auto">
            {suggestions.map((movie) => (
              <li
                key={movie.id}
                className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 cursor-pointer"
                onClick={() => onSelectSuggestion(movie)}
              >
                {movie.poster && (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-8 h-12 object-cover rounded"
                  />
                )}
                <span className="text-sm">{movie.title}</span>
              </li>
            ))}
          </ul>
        )}
      </form>
    </div>
  );
}

export default SearchPanel;
