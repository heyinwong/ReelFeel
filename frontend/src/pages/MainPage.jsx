import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import RecommendBlock from "../components/RecommendBlock";
import HeaderBar from "../components/HeaderBar";
import MovieModal from "../components/MovieModal";
import HeroSection from "../components/HeroSection";
import SearchPanel from "../components/SearchPanel";
import useAuth from "../hooks/useAuth";
import API from "../utils/api";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setSelectedSuggestion(null);
    if (mode === "search") {
      setRecommendations([]);
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length >= 2 && mode === "search" && !isSubmitting) {
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
    setIsSubmitting(true);
    setSuggestions([]);
    setSubmittedMood(input);
    setRecommendations([]);
    setLoading(true);

    try {
      let response;
      if (mode === "search") {
        response = await API.post("/search", { mood: input });
      } else if (!user) {
        response = await API.post("/recommend", { mood: input });
      } else {
        response = await API.post("/recommend", {
          mood: input,
          user_id: user.id,
          mode: undefined,
        });
      }

      const data = response.data;
      const raw = data.recommendations || [];

      const normalized = raw.map((movie) => ({
        title: movie.title,
        description:
          movie.description || movie.overview || "No description available.",
        tmdb_rating: movie.tmdb_rating || movie.rating || "N/A",
        poster: movie.poster || "",
        backdrop: movie.backdrop || "",
        reason: movie.reason || "",
      }));

      setRecommendations(normalized);
    } catch (error) {
      console.error("Failed to fetch:", error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
    setIsSubmitting(false);
  };

  const handleSelectSuggestion = async (movie) => {
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
        description: movie.description || "No description available.",
        tmdb_rating: movie.tmdb_rating || "N/A",
        poster: movie.poster || "",
        backdrop: movie.backdrop || "",
      }));

      setRecommendations(normalized);
    } catch (err) {
      console.error("Failed to fetch movie detail by title", err);
      setRecommendations([]);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#281B13] text-white">
      <HeaderBar className="fixed top-0 left-0 w-full z-50" />

      <HeroSection
        title="Your reel. Your taste."
        subtitle1="ReelFeel uses AI taste modeling to understand your cinematic identity."
        subtitle2="It finds the stories that resonate with your thoughts and emotions."
        imageSrc="/hero.jpg" // 可省略，默认就是这个
      />
      <div className="relative z-20 -mt-16 sm:-mt-20 flex justify-center px-4">
        <SearchPanel
          mode={mode}
          input={input}
          suggestions={suggestions}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onSwitchMode={() => {
            setMode(mode === "mood" ? "search" : "mood");
            setRecommendations([]);
            setSuggestions([]);
            setSubmittedMood("");
            setSelectedSuggestion(null);
            setInput("");
          }}
          onSelectSuggestion={handleSelectSuggestion}
        />
      </div>
      <div className="px-4 w-full z-10 min-h-[300px] flex items-center justify-center">
        {loading ? (
          <RecommendBlock
            mood={submittedMood}
            recommendations={[]} // 空列表，用于 loading 状态占位
            loading={true}
            user={user}
          />
        ) : recommendations.length > 0 ? (
          <RecommendBlock
            mood={submittedMood}
            recommendations={recommendations}
            loading={false}
            user={user}
            onCardClick={setSelectedMovie}
          />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[220px] text-center px-4">
            <motion.h2
              key={mode + "-slogan"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-[#F3E2D4] drop-shadow-sm"
            >
              {mode === "mood"
                ? "Let your reel unfold from who you are."
                : "Seeking something specific?"}
            </motion.h2>

            <motion.p
              key={mode + "-desc"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[#F3E2D4]/90 text-base sm:text-lg mt-3 max-w-xl"
            >
              {mode === "mood"
                ? "Describe a feeling, a vibe, or a fleeting thought. We'll find a film that echoes it."
                : "Type a movie title, or explore suggestions that resonate with your taste."}
            </motion.p>
          </div>
        )}
      </div>
      {selectedMovie && typeof selectedMovie === "object" && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          readOnly={true}
        />
      )}
      <Footer />
    </div>
  );
}

export default MainPage;
