import { useState } from "react";
import API from "../utils/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
      await API.post("/update_summary", { feedback: input });
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
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="bg-[#F3E2D4] text-[#281B13] rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-2xl border border-[#e0d2c0]"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <h2 className="text-center text-lg sm:text-xl font-semibold mb-5">
            Let us fine-tune your taste profile
          </h2>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. I actually prefer comedies over drama."
            className="w-full h-28 sm:h-32 p-4 rounded-xl border border-[#d3bfa6] bg-white text-sm sm:text-base text-[#281B13] placeholder:text-[#b79f89] focus:outline-none focus:ring-2 focus:ring-[#FC7023]/60 transition"
          />

          <div className="mt-6 flex flex-col sm:flex-row justify-end sm:justify-between gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-md border border-[#d6c3b0] text-[#a18469] hover:text-white hover:bg-[#a18469] transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 rounded-md bg-[#FC7023] text-white hover:bg-orange-500 transition text-sm"
            >
              {loading ? "Updating..." : "Submit"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default UpdateSummaryModal;
