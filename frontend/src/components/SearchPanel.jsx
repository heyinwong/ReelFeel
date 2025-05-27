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
    <div className="w-full bg-[#281B13] pt-4 pb-10 px-4 flex flex-col items-center -mt-12">
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
          <ul className="absolute top-full left-0 mt-2 w-full bg-[#1f1f25]/95 border border-[#FC7023]/30 rounded-xl shadow-xl backdrop-blur-sm z-50 text-white max-h-[240px] overflow-y-auto transition-all duration-300">
            {suggestions.map((movie) => (
              <li
                key={movie.id}
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#FC7023]/20 cursor-pointer transition-all"
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
    </div>
  );
}

export default SearchPanel;
