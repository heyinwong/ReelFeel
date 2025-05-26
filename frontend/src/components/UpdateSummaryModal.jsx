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
      onUpdated?.(); // 通知父组件刷新 summary
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
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Tell us how to improve your AI summary
        </h2>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-32 border border-gray-300 rounded p-2 text-sm"
          placeholder="Example: I actually prefer comedies over drama."
        />
        <div className="flex justify-end mt-4 gap-3">
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Updating..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdateSummaryModal;
