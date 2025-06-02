import React, { useState } from "react";

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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 border border-[#FC7023] rounded-md text-sm font-medium text-[#F3E2D4] bg-transparent hover:bg-[#FC7023]/10 transition"
      >
        + Select Moods ▾
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center px-4">
          <div className="bg-[#281B13] border border-[#FC7023] rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#F3E2D4]">
                Select Your Moods
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-[#FC7023] text-xl hover:scale-110 transition"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {moodOptions.map(({ emoji, tag }) => {
                const selected = selectedMoods.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleMood(tag)}
                    className={`px-3 py-2 rounded-full border text-sm font-medium transition-all ${
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
        </div>
      )}
    </>
  );
}

export default MoodSelector;
