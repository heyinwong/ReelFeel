// components/Switch.jsx
import React from "react";

function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[18px] w-[34px] shrink-0 cursor-pointer rounded-full border border-white/30 transition-colors duration-200 focus:outline-none ${
        checked ? "bg-white/80" : "bg-white/30"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-[14px] w-[14px] transform rounded-full bg-black shadow-sm transition duration-200 ${
          checked ? "translate-x-[16px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default Switch;
