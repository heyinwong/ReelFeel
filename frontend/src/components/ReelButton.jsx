function ReelButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`border border-[#FC7023] text-[#FC7023] hover:bg-[#FC7023] hover:text-[#281B13] transition-colors rounded-full px-4 py-2 text-sm font-semibold tracking-wide ${className}`}
    >
      {children}
    </button>
  );
}

export default ReelButton;
