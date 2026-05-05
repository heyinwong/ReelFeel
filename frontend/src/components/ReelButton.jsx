function ReelButton({ children, onClick, className = "", active = false, variant = "outline" }) {
  const baseClass =
    "transition-colors rounded-xl px-4 py-2 text-[13px] font-bold tracking-wide";
  const toneClass =
    variant === "solid"
      ? "border border-[#FC7023] bg-[#FC7023] text-[#281B13] shadow-[0_8px_18px_rgba(252,112,35,0.22)] hover:bg-[#ff8b45]"
      : active
        ? "border border-[#FC7023] bg-[#FC7023] text-[#281B13]"
        : "border border-[#FC7023] text-[#FC7023] hover:bg-[#FC7023] hover:text-[#281B13]";

  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${toneClass} ${className}`}
    >
      {children}
    </button>
  );
}

export default ReelButton;
