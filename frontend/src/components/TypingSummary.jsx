import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

function TypingSummary({ text = "", onDone }) {
  const [displayed, setDisplayed] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!text) return;

    let i = 0;
    setDisplayed("");

    intervalRef.current = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(intervalRef.current);
        onDone?.();
      }
    }, 30);

    return () => clearInterval(intervalRef.current);
  }, [text, onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded shadow p-5 text-gray-700 text-base whitespace-pre-wrap"
    >
      {displayed}
    </motion.div>
  );
}

export default TypingSummary;
