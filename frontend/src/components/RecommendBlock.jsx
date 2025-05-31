import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../utils/api";

import CarouselStrip from "./CarouselStrip";
import MovieDetailBlock from "./MovieDetailBlock";

function RecommendBlock({ recommendations, loading, user, onCardClick }) {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const handleAdd = async (movie, listType) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const endpoint = listType === "watched" ? "watched" : "waiting";
    try {
      const response = await API.post(`/${endpoint}`, {
        ...movie,
        watch_date: new Date().toISOString().split("T")[0],
      });

      if (response.status !== 200) {
        throw new Error(response.data?.detail || "Failed to add");
      }

      toast.success(
        `Added to ${listType === "watched" ? "Reel Log" : "Watchlist"}`
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to add movie.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-12">
        <div className="w-8 h-8 border-4 border-orange-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 px-4 sm:px-6 overflow-x-hidden overflow-y-hidden transition-all duration-300 ease-in-out">
      <CarouselStrip
        movies={recommendations}
        current={current}
        setCurrent={setCurrent}
        onCardClick={onCardClick}
      />
      <MovieDetailBlock
        movie={recommendations[current]}
        user={user}
        onAdd={handleAdd} // ✅ 修正这里
      />
    </div>
  );
}

export default RecommendBlock;
