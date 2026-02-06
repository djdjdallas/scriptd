'use client';

export function TourOverlay({ targetRect }) {
  if (!targetRect) return null;

  const padding = 6;
  const cutout = {
    top: targetRect.top - padding,
    left: targetRect.left - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
  };

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-auto">
      {/* Dark backdrop with cutout via clip-path */}
      <div
        className="absolute inset-0 transition-all duration-300 ease-out"
        style={{
          background: 'rgba(0, 0, 0, 0.75)',
          clipPath: `polygon(
            0% 0%, 0% 100%,
            ${cutout.left}px 100%,
            ${cutout.left}px ${cutout.top}px,
            ${cutout.left + cutout.width}px ${cutout.top}px,
            ${cutout.left + cutout.width}px ${cutout.top + cutout.height}px,
            ${cutout.left}px ${cutout.top + cutout.height}px,
            ${cutout.left}px 100%,
            100% 100%, 100% 0%
          )`,
        }}
      />

      {/* Pulsing ring around cutout */}
      <div
        className="absolute rounded-xl pointer-events-none transition-all duration-300 ease-out"
        style={{
          top: cutout.top - 3,
          left: cutout.left - 3,
          width: cutout.width + 6,
          height: cutout.height + 6,
          border: '2px solid rgba(168, 85, 247, 0.7)',
          animation: 'tour-pulse 2s ease-in-out infinite',
        }}
      />

      {/* Pulse animation styles */}
      <style jsx>{`
        @keyframes tour-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(168, 85, 247, 0);
          }
        }
      `}</style>
    </div>
  );
}
