function ReelButton({ children, onClick, className = "", active = false, variant = "outline" }) {
  const baseClass =
    "transition-colors rounded-full px-4 py-2 text-sm font-semibold tracking-wide";
  const toneClass =
    variant === "solid"
      ? "border border-[#FC7023] bg-[#FC7023] text-[#281B13] hover:bg-[#ff8b45]"
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
