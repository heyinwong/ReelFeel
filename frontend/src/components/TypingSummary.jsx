import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

function TypingSummary({ text = "", highlightTitles = [], onDone }) {
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

  // ✅ 精确高亮 highlightTitles 中的电影名（部分匹配也可以）
  const highlighted = [];
  let remaining = displayed;
  let key = 0;

  while (remaining.length > 0) {
    let matchIndex = -1;
    let matchedTitle = "";

    for (const title of highlightTitles) {
      const idx = remaining.toLowerCase().indexOf(title.toLowerCase());
      if (idx !== -1 && (matchIndex === -1 || idx < matchIndex)) {
        matchIndex = idx;
        matchedTitle = title;
      }
    }

    if (matchIndex === -1) {
      highlighted.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (matchIndex > 0) {
      highlighted.push(
        <span key={key++}>{remaining.slice(0, matchIndex)}</span>
      );
    }

    highlighted.push(
      <span key={key++} className="font-semibold italic text-[#FC7023]">
        {remaining.slice(matchIndex, matchIndex + matchedTitle.length)}
      </span>
    );

    remaining = remaining.slice(matchIndex + matchedTitle.length);
  }

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
