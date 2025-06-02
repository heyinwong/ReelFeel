import React, { useState, useRef, useEffect } from "react";

const defaultMoodOptions = [
  { emoji: "😭", tag: "Moved" },
  { emoji: "😂", tag: "Hilarious" },
  { emoji: "🤔", tag: "Thoughtful" },
  { emoji: "💖", tag: "Heartwarming" },
  { emoji: "✨", tag: "Beautiful" },
  { emoji: "😱", tag: "Thrilling" },
  { emoji: "🎶", tag: "Musical" },
  { emoji: "👀", tag: "Suspenseful" },
  { emoji: "😴", tag: "Slow" },
  { emoji: "💔", tag: "Tragic" },
];

function MoodSelector({
  selectedMoods,
  toggleMood,
  moodOptions = defaultMoodOptions,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // 点击外部时自动关闭
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 border border-[#FC7023] rounded-md text-sm font-medium text-[#F3E2D4] bg-transparent hover:bg-[#FC7023]/10 transition"
      >
        + Select Moods ▾
      </button>

      {selectedMoods.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          {selectedMoods.map((tag) => {
            const emoji = moodOptions.find((m) => m.tag === tag)?.emoji;
            return (
              <span
                key={tag}
                className="bg-[#FC7023] text-[#281B13] px-2 py-0.5 rounded-full"
              >
                {emoji} {tag}
              </span>
            );
          })}
        </div>
      )}

      {open && (
        <div className="absolute z-20 mt-2 bg-[#281B13] border border-[#FC7023] rounded-lg p-3 shadow-lg w-full max-w-md">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {moodOptions.map(({ emoji, tag }) => {
              const selected = selectedMoods.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleMood(tag)}
                  className={`px-2 py-1 rounded-full border text-sm font-medium transition-all ${
                    selected
                      ? "bg-[#FC7023] text-[#281B13] border-[#FC7023]"
                      : "border-[#FC7023]/50 text-[#F3E2D4]/80 hover:border-[#FC7023] hover:text-[#F3E2D4]"
                  }`}
                >
                  {emoji} {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MoodSelector;
