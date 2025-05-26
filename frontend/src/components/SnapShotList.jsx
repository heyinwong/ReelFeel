import { motion, AnimatePresence } from "framer-motion";

function SnapShotList({ snapshots, onDelete }) {
  if (!snapshots || snapshots.length === 0) {
    return <p className="text-gray-500">No snapshots yet.</p>;
  }

  return (
    <ul className="space-y-4">
      <AnimatePresence>
        {snapshots.map((s, i) => {
          const isCorrection = s.movie_id === null;
          const tagText = isCorrection
            ? "User"
            : s.comment.match(/'(.*?)'/)?.[1] || "Movie";

          return (
            <motion.li
              key={s.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="group bg-white border border-gray-200 hover:border-gray-400 rounded p-4 shadow-sm transition-all duration-200 hover:scale-[1.015] flex justify-between items-start"
            >
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">
                  {new Date(s.timestamp).toLocaleString()}
                </div>
                <div>
                  <span className="inline-block bg-gray-100 text-indigo-600 text-xs font-semibold px-2 py-1 rounded mr-2">
                    {tagText}
                  </span>
                  <span>{s.comment.replace(/^The user/, "You")}</span>
                </div>
              </div>
              {onDelete && (
                <button
                  className="text-sm text-red-500 hover:underline ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  onClick={() => onDelete(s)}
                >
                  Delete
                </button>
              )}
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

export default SnapShotList;
