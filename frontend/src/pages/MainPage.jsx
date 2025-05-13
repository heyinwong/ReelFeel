import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RecommendBlock from "../components/RecommendBlock";
import HeaderBar from "../components/HeaderBar";

function MainPage() {
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState("mood"); // "mood" or "search"
  const [input, setInput] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmittedMood(input);
    setLoading(true);
    setRecommendations([]);

    const endpoint = mode === "mood" ? "recommend" : "search";

    try {
      const response = await fetch(`http://localhost:8000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: input }),
      });

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Failed to fetch:", error);
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
      className="relative min-h-screen w-full text-white flex flex-col items-center justify-center pt-20"
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

      {/* 顶部文字 */}
      <div className="z-10 text-center px-4 mt-10">
        <h1 className="text-4xl font-bold mb-2 drop-shadow-md">
          {mode === "mood"
            ? "Your mood. Your movie."
            : "Looking for something?"}
        </h1>
        <p className="text-white text-opacity-60 text-lg mb-8">
          {mode === "mood"
            ? "Discover a film that fits your mood."
            : "Search directly for the film you have in mind."}
        </p>
      </div>

      {/* 输入 + 切换 + 提交 */}
      <form
        onSubmit={handleSubmit}
        className="z-10 w-full max-w-3xl bg-black/40 backdrop-blur-md px-6 py-5 rounded-xl shadow-lg flex flex-col items-center"
      >
        <div className="flex items-center w-full gap-3 mb-4">
          {/* 切换按钮 */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => setMode(mode === "mood" ? "search" : "mood")}
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

          {/* 输入框 */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "mood"
                ? "e.g. Something nostalgic and heartwarming"
                : "e.g. Inception, Interstellar"
            }
            className="flex-1 h-[48px] px-4 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
          />

          {/* 提交按钮 */}
          <button
            type="submit"
            className="w-[130px] h-[48px] text-center border border-white/30 bg-white/10 text-white rounded-md text-base font-medium hover:bg-white/20 transition"
          >
            {mode === "mood" ? "Recommend" : "Find Movie"}
          </button>
        </div>
      </form>

      {/* 推荐 / 搜索结果 */}
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
