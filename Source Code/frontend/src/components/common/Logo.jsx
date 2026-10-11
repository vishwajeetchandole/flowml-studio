import React from 'react';

/**
 * Reusable FlowML Live-Text Wordmark
 * "Flow" in #1F1B2E and "ML" in #7C3AED
 * Typography: font-display, weight 800, tracking -0.03em, 24-32px (customizable)
 */
export default function Logo({
  className = '',
  size = 'text-2xl',
  showBadge = false,
  badgeText = 'v2.4',
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <span className={`font-display font-extrabold tracking-[-0.03em] ${size} leading-none text-[#1F1B2E]`}>
        Flow<span className="text-[#7C3AED]">ML</span>
      </span>
      {showBadge && (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          {badgeText}
        </span>
      )}
    </div>
  );
}
