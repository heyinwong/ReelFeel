import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RecommendBlock from "../components/RecommendBlock";
import HeaderBar from "../components/HeaderBar";

function MainPage() {
  const [username, setUsername] = useState("");
  const [mood, setMood] = useState("");
  const [submittedMood, setSubmittedMood] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("username");
    if (name) {
      setUsername(name);
    }
  }, []);

  const handleRecommend = (e) => {
    e.preventDefault();
    if (mood.trim() !== "") {
      setSubmittedMood(mood.trim());
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername("");
    setSubmittedMood("");
    navigate("/");
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col">
      <HeaderBar username={username} onLogout={handleLogout} />

      {/* Main content */}
      <main className="flex-1 flex flex-col justify-center items-center px-6">
        <h2 className="text-2xl font-medium mb-4 text-gray-700">
          How are you feeling today?
        </h2>

        {username && (
          <p className="text-gray-600 mb-4">Hi {username}! Welcome back 👋</p>
        )}

        <form
          onSubmit={handleRecommend}
          className="w-full max-w-xl flex flex-col items-center"
        >
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="e.g. I feel tired and want something cozy"
            className="w-full px-4 py-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition"
          >
            Recommend Movies
          </button>
        </form>

        {/* 推荐区块（仅在提交后显示） */}
        <RecommendBlock mood={submittedMood} />
      </main>
    </div>
  );
}

export default MainPage;
