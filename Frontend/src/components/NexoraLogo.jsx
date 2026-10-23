import React from "react";

/**
 * NexoraLogo: Custom high-tech vector logo for Nexora AI platform.
 * Styled using the exact brand color palette:
 * - #DB2D28 (Crimson Red)
 * - #A41715 (Deep Ruby)
 * - #40080A (Dark Wine / Maroon)
 * - #6D7C83 (Slate Gray)
 * - #41494F (Charcoal)
 * - #070B0D (Obsidian Black)
 */
export const NexoraIcon = ({ size = 32, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 transition-transform duration-300 group-hover:scale-105 ${className}`}
  >
    <defs>
      {/* Primary Crimson to Ruby Gradient */}
      <linearGradient id="nexoraCrimsonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#DB2D28" />
        <stop offset="60%" stopColor="#A41715" />
        <stop offset="100%" stopColor="#40080A" />
      </linearGradient>

      {/* Crossbar Slash Gradient */}
      <linearGradient id="nexoraSlashGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#A41715" />
        <stop offset="50%" stopColor="#DB2D28" />
        <stop offset="100%" stopColor="#6D7C83" />
      </linearGradient>

      {/* Border Gradient */}
      <linearGradient id="nexoraBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#DB2D28" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#41494F" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#40080A" stopOpacity="0.8" />
      </linearGradient>

      {/* Specular Shine */}
      <linearGradient id="nexoraShine" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Outer Rounded Container */}
    <rect
      x="2"
      y="2"
      width="36"
      height="36"
      rx="10"
      fill="#070B0D"
      stroke="url(#nexoraBorderGrad)"
      strokeWidth="1.5"
    />

    {/* Subtle Inner Crimson Fill */}
    <rect
      x="2"
      y="2"
      width="36"
      height="36"
      rx="10"
      fill="url(#nexoraCrimsonGrad)"
      fillOpacity="0.1"
    />

    {/* Geometric Monogram 'N' */}
    {/* Left Vertical Stem */}
    <path
      d="M10 29V11C10 9.89543 10.8954 9 12 9H13.5C14.3284 9 15 9.67157 15 10.5V29.5C15 30.3284 14.3284 31 13.5 31H12C10.8954 31 10 30.1046 10 29Z"
      fill="url(#nexoraCrimsonGrad)"
    />

    {/* Right Vertical Stem */}
    <path
      d="M25 10.5V29C25 30.1046 25.8954 31 27 31H28.5C29.3284 31 30 30.3284 30 29.5V11C30 9.89543 29.1046 9 28 9H26.5C25.6716 9 25 9.67157 25 10.5Z"
      fill="url(#nexoraCrimsonGrad)"
    />

    {/* Diagonal Slash */}
    <path
      d="M13.5 9.5L26.5 30.5H24.5L11.5 9.5H13.5Z"
      fill="url(#nexoraSlashGrad)"
    />

    {/* Center Core Spark */}
    <path
      d="M20 16L23 20L20 24L17 20L20 16Z"
      fill="#FFFFFF"
      fillOpacity="0.95"
      filter="drop-shadow(0 0 6px #DB2D28)"
    />

    {/* Specular Gloss Overlay */}
    <rect
      x="2"
      y="2"
      width="36"
      height="18"
      rx="10"
      fill="url(#nexoraShine)"
      pointerEvents="none"
    />
  </svg>
);

const NexoraLogo = ({
  size = "md",
  showText = true,
  subtitle = null,
  className = "",
}) => {
  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const currentIconSize = iconSizes[size] || 32;
  const currentTextSize = textSizes[size] || "text-lg";

  return (
    <div className={`group flex items-center gap-2.5 ${className}`}>
      <NexoraIcon size={currentIconSize} />
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-semibold tracking-tight text-white ${currentTextSize}`}
          >
            Nex<span className="bg-gradient-to-r from-[#DB2D28] via-[#A41715] to-[#6D7C83] bg-clip-text text-transparent">ora</span>
          </span>
          {subtitle && (
            <span className="text-[10px] font-mono tracking-widest text-[#6D7C83] uppercase">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default NexoraLogo;
