import { motion, AnimatePresence } from "framer-motion";

function SnapShotList({ snapshots, onDelete }) {
  if (!snapshots || snapshots.length === 0) {
    return <p className="text-gray-500">No snapshots yet.</p>;
  }

  return (
    <ul className="space-y-4">
      <AnimatePresence>
        {snapshots.map((s, i) => (
          <motion.li
            key={s.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white border rounded p-4 shadow-sm flex justify-between items-start"
          >
            <div>
              <div className="text-xs text-gray-500 mb-1">
                {new Date(s.timestamp).toLocaleString()}
              </div>
              <div>{s.comment.replace(/^The user/, "You")}</div>
            </div>
            {onDelete && (
              <button
                className="text-sm text-red-500 hover:underline ml-4"
                onClick={() => onDelete(s)}
              >
                Delete
              </button>
            )}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

export default SnapShotList;
