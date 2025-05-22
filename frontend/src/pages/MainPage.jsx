import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import RecommendBlock from "../components/RecommendBlock";
import HeaderBar from "../components/HeaderBar";
import MovieModal from "../components/MovieModal";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import API from "../utils/api";

function MainPage() {
  const { user, isLoading } = useAuth();
  const [mode, setMode] = useState("mood");
  const [input, setInput] = useState("");
  const [submittedMood, setSubmittedMood] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setSelectedSuggestion(null);
    if (mode === "search") {
      setRecommendations([]);
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length >= 2 && mode === "search") {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
    }
  };

  const fetchSuggestions = async (query) => {
    try {
      const res = await API.get("/search_suggestions", {
        params: { query },
      });
      const data = res.data;
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("Failed to fetch suggestions", err);
      setSuggestions([]);
    }
  };

  const handleSubmit = async (e = null) => {
    if (e) e.preventDefault();
    setSuggestions([]);
    setSubmittedMood(input);
    setRecommendations([]);
    setLoading(true);

    try {
      const endpoint = mode === "search" ? "/search" : "/recommend";
      const response = await API.post(endpoint, { mood: input });
      const data = response.data;
      const raw = data.recommendations || [];

      const normalized = raw.map((movie) => ({
        title: movie.title,
        description:
          movie.description || movie.overview || "No description available.",
        tmdb_rating: movie.tmdb_rating || movie.rating || "N/A",
        poster: movie.poster || "",
        backdrop: movie.backdrop || "",
      }));

      setRecommendations(normalized);
    } catch (error) {
      console.error("Failed to fetch:", error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full text-white flex flex-col items-center justify-center pt-20"
      style={{
        backgroundImage: "url('/blue_light_bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#000000",
      }}
    >
      <HeaderBar className="fixed top-0 left-0 w-full z-50" />

      <div className="z-10 text-center px-4 mt-10">
        <motion.h1
          key={mode}
          className="text-4xl font-extrabold mb-2 tracking-wide drop-shadow-md text-transparent bg-clip-text"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #ffffff, #d1d5db, #ffffff)",
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0 }}
        >
          {mode === "mood"
            ? "Your mood. Your movie."
            : "Looking for something?"}
        </motion.h1>

        <motion.p
          key={mode + "-p"}
          className="text-white text-opacity-70 text-lg mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
        >
          {mode === "mood"
            ? "Discover a film that fits your mood."
            : "Search any film you have in mind."}
        </motion.p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-3xl bg-black/40 backdrop-blur-md px-6 py-5 rounded-xl shadow-lg flex flex-col items-center"
      >
        <div className="flex items-center w-full gap-3 mb-4">
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "mood" ? "search" : "mood");
                setRecommendations([]);
                setSuggestions([]);
                setSubmittedMood("");
                setSelectedSuggestion(null);
                setInput("");
              }}
              className="w-[130px] h-[48px] border border-white/30 bg-white/10 text-white rounded-md text-base font-medium hover:bg-white/20 transition cursor-pointer"
            >
              {mode === "mood" ? "Mood" : "Search"}
            </button>
            <div className="absolute left-0 bottom-full mb-1 px-2 py-1 bg-black/80 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
              {mode === "mood"
                ? "Switch to search by title"
                : "Switch to mood-based recommendation"}
            </div>
          </div>

          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={
              mode === "mood"
                ? "e.g. Something nostalgic and heartwarming"
                : "e.g. Inception, Interstellar"
            }
            className="flex-1 h-[48px] px-4 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
          />

          <button
            type="submit"
            className="w-[130px] h-[48px] text-center border border-white/30 bg-white/10 text-white rounded-md text-base font-medium hover:bg-white/20 transition"
          >
            {mode === "mood" ? "Recommend" : "Find Movie"}
          </button>
        </div>

        {mode === "search" && suggestions.length > 0 && (
          <ul className="absolute top-full mt-1 left-0 w-full max-w-xl bg-black/80 border border-white/20 rounded-md shadow-lg z-50 text-white overflow-hidden">
            {suggestions.map((movie) => (
              <li
                key={movie.id}
                className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 cursor-pointer"
                onClick={async () => {
                  setSelectedSuggestion(movie);
                  setSuggestions([]);
                  setInput(movie.title);
                  try {
                    const res = await API.get("/movie_by_title", {
                      params: { title: movie.title },
                    });
                    const data = res.data;
                    const result = data.recommendations || [];

                    const normalized = result.map((movie) => ({
                      title: movie.title,
                      description:
                        movie.description || "No description available.",
                      tmdb_rating: movie.tmdb_rating || "N/A",
                      poster: movie.poster || "",
                      backdrop: movie.backdrop || "",
                    }));

                    setRecommendations(normalized);
                  } catch (err) {
                    console.error("Failed to fetch movie detail by title", err);
                    setRecommendations([]);
                  }
                }}
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

      <div className="mt-10 px-4 w-full z-10">
        <RecommendBlock
          mood={submittedMood}
          recommendations={recommendations}
          loading={loading}
          user={user}
          onCardClick={setSelectedMovie}
        />
      </div>

      {selectedMovie && typeof selectedMovie === "object" && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          readOnly={true}
        />
      )}
    </div>
  );
}

export default MainPage;
