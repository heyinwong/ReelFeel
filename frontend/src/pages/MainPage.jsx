import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RecommendBlock from "../components/RecommendBlock";
import HeaderBar from "../components/HeaderBar";

function MainPage() {
  const [username, setUsername] = useState("");
  const [mood, setMood] = useState("");
  const [submittedMood, setSubmittedMood] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("username");
    if (name) {
      setUsername(name);
    }
  }, []);

  const handleRecommend = async (e) => {
    e.preventDefault();
    setSubmittedMood(mood);
    setLoading(true);
    setRecommendations([]);

    try {
      const response = await fetch("http://localhost:8000/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mood }),
      });

      const data = await response.json();

      if (data.recommendations) {
        setRecommendations(data.recommendations);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername("");
    setSubmittedMood("");
    navigate("/");
  };

  return (
    <div
      className="relative min-h-screen w-full text-white flex flex-col items-center justify-center"
      style={{
        backgroundImage: "url('/blue_light_bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#000000",
      }}
    >
      <HeaderBar
        username={username}
        onLogout={handleLogout}
        className="fixed top-0 left-0 w-full z-50"
      />

      {/* 主文字区域 */}
      <div className="z-10 text-center px-4 mt-10">
        <h1 className="text-4xl font-bold mb-2 drop-shadow-md">
          Your mood. Your movie.
        </h1>
        <p className="text-white text-opacity-60 text-lg mb-8">
          Discover a film that fits your mood.
        </p>
      </div>

      {/* 推荐表单 */}
      <form
        onSubmit={handleRecommend}
        className="z-10 w-full max-w-xl bg-black/50 backdrop-blur-md p-6 rounded-xl shadow-lg flex flex-col items-center"
      >
        <button
          type="submit"
          className="bg-gradient-to-r from-gray-200/10 to-white/10 border border-white/30 text-white py-2 px-6 rounded-md hover:bg-white/20 transition mb-4"
        >
          Recommend Movies
        </button>
        <input
          type="text"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="e.g. Something nostalgic and heartwarming"
          className="w-full px-4 py-3 rounded-md bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </form>

      {/* 推荐结果 */}
      <div className="mt-10 px-4 w-full z-10">
        <RecommendBlock
          mood={submittedMood}
          recommendations={recommendations}
          loading={loading}
          username={username}
        />
      </div>
    </div>
  );
}

export default MainPage;
