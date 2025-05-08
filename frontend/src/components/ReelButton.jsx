function ReelButton({
  children,
  onClick,
  variant = "reel",
  className = "",
  type = "button",
  size = "base", // 新增 size 参数
}) {
  const base = "btn transition duration-200";

  const variants = {
    primary: "btn-primary",
    ghost: "btn-ghost",
    accent: "btn-accent",
    reel:
      "btn btn-outline border-dashed border-white text-white rounded-xl " +
      "hover:bg-white hover:text-black hover:shadow-md tracking-wide",
  };

  const sizes = {
    base: "text-sm sm:text-base px-4 py-2",
    lg: "text-base sm:text-lg px-6 py-3", // 新增 lg 尺寸
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export default ReelButton;
