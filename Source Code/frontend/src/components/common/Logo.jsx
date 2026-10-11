import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable FlowML Live-Text Wordmark
 * Clicking navigates to '/' (home page) across the entire application by default.
 */
export default function Logo({
  className = '',
  size = 'text-2xl',
  showBadge = false,
  badgeText = 'v2.4',
  onClick,
}) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate('/');
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`inline-flex items-center gap-2 select-none cursor-pointer group ${className}`}
      title="Go to Home"
    >
      <span className={`font-display font-extrabold tracking-[-0.03em] ${size} leading-none text-[#1F1B2E] group-hover:opacity-90 transition-opacity`}>
        Flow<span className="text-[#7C3AED]">ML</span>
      </span>
      {showBadge && (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-violet-50 text-violet-700 border border-violet-200">
          {badgeText}
        </span>
      )}
    </div>
  );
}
