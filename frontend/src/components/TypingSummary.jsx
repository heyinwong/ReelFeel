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

  // 高亮电影名（用单引号包裹的部分）
  const highlighted = displayed.split(/('.*?')/g).map((part, idx) => {
    if (/^'.*'$/.test(part)) {
      return (
        <span key={idx} className="font-semibold italic text-[#FC7023]">
          {part.replace(/'/g, "")}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#F3E2D4]/80 text-[#281B13] text-[15px] leading-relaxed tracking-wide text-left rounded-md shadow px-5 py-4 whitespace-pre-line"
    >
      {highlighted}
    </motion.div>
  );
}

export default TypingSummary;
