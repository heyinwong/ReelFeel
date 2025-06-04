import { useState } from "react";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function SnapShotList({ snapshots, onDelete }) {
  const [selectedId, setSelectedId] = useState(null);

  if (!snapshots || snapshots.length === 0) {
    return <p className="text-[#F3E2D4]/60">No snapshots yet.</p>;
  }

  const sorted = [...snapshots].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <ul className="max-w-full space-y-6 border-l border-[#FC7023]/40 pl-8 relative">
        <AnimatePresence initial={false}>
          {sorted.map((s) => {
            const isCorrection = s.movie_id === null;
            const isSelected = s.id === selectedId;

            return (
              <motion.li
                key={s.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="relative group max-w-full overflow-hidden"
              >
                {/* Timeline Dot */}
                <div className="absolute left-[-1.25rem] top-1.5 w-3 h-3 rounded-full bg-[#FC7023] border border-[#F3E2D4]" />

                {/* Summary line */}
                <div
                  className="cursor-pointer text-sm text-[#F3E2D4] hover:text-[#FC7023] transition flex items-center gap-2"
                  onClick={() =>
                    setSelectedId((prev) => (prev === s.id ? null : s.id))
                  }
                >
                  <span>{new Date(s.timestamp).toLocaleDateString()}</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold text-white ${
                      isCorrection ? "bg-[#b85e2e]" : "bg-[#FC7023]"
                    } `}
                  >
                    {isCorrection ? "User" : s.movie_title ?? "Movie"}
                  </span>
                </div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="bg-[#E9D6C5] text-[#281B13] mt-2 rounded-md p-4 text-sm leading-relaxed border border-[#dcc6b0] max-w-full overflow-hidden"
                    >
                      <div className="flex justify-between items-start">
                        <p className="pr-2 break-words">
                          {s.comment.replace(/^The user/, "You")}
                        </p>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(s)}
                            className="text-[#9e3b3b] hover:text-red-600 transition ml-4 shrink-0"
                            title="Delete snapshot"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

export default SnapShotList;
