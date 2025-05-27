import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import RecommendBlock from "../components/RecommendBlock";
import HeaderBar from "../components/HeaderBar";
import MovieModal from "../components/MovieModal";
import HeroSection from "../components/HeroSection";
import SearchPanel from "../components/SearchPanel";
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

      <HeroSection />

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

      <div className=" px-4 w-full z-10 min-h-[300px] flex items-center justify-center">
        {recommendations.length > 0 ? (
          <RecommendBlock
            mood={submittedMood}
            recommendations={recommendations}
            loading={loading}
            user={user}
            onCardClick={setSelectedMovie}
          />
        ) : (
          <p className="text-[#F3E2D4] text-xl italic opacity-80 -translate-y-6 text-center">
            Let’s find a film that suits your mood.
          </p>
        )}
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
