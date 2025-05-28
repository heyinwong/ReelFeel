import { useState } from "react";
import API from "../utils/api";
import toast from "react-hot-toast";

function UpdateSummaryModal({ onClose, onUpdated }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast.error("Please enter your feedback.");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/update_summary", { feedback: input });
      toast.success("Summary updated.");
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error("Failed to update summary:", err);
      toast.error("Failed to update summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F3E2D4] text-[#281B13] rounded-xl w-full max-w-xl p-6 shadow-xl border border-[#dcc6b0] transition-all"
      >
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
          Help us improve your AI summary
        </h2>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. I actually prefer comedies over drama."
          className="w-full h-28 p-3 rounded-md border border-[#c9b7a2] bg-white text-sm text-[#281B13] placeholder:text-[#b79f89] focus:outline-none focus:ring-2 focus:ring-[#FC7023]/60 transition"
        />

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-[#b79f89] text-[#b79f89] hover:text-white hover:bg-[#b79f89] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-1.5 rounded-md bg-[#FC7023] text-white hover:bg-orange-500 transition"
          >
            {loading ? "Updating..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdateSummaryModal;
