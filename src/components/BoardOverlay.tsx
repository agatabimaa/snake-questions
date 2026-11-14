import React from 'react';
import { LADDERS, SNAKES, getTileCoordinates } from '../utils/board';

interface SnakeConfig {
  from: number;
  to: number;
  color: string;
  patternColor: string;
  curveFactor: number;
}

const SNAKE_STYLES: SnakeConfig[] = [
  { from: 48, to: 30, color: '#38B000', patternColor: '#CCFF33', curveFactor: 60 },
  { from: 44, to: 25, color: '#FF758F', patternColor: '#C9184A', curveFactor: -70 },
  { from: 35, to: 18, color: '#FFB703', patternColor: '#FB8500', curveFactor: 65 },
  { from: 27, to: 11, color: '#9D4EDD', patternColor: '#E2C2FF', curveFactor: -60 },
  { from: 20, to: 6, color: '#06D6A0', patternColor: '#118AB2', curveFactor: 55 },
];

export const BoardOverlay: React.FC = () => {
  // Render Ladders
  const renderLadders = () => {
    return Object.entries(LADDERS).map(([startStr, endNum]) => {
      const startNum = parseInt(startStr, 10);
      const startCoord = getTileCoordinates(startNum);
      const endCoord = getTileCoordinates(endNum);

      const dx = endCoord.x - startCoord.x;
      const dy = endCoord.y - startCoord.y;
      const length = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      // Perpendicular vector for ladder width
      const ladderWidth = 18;
      const perpX = -Math.sin(angle) * ladderWidth;
      const perpY = Math.cos(angle) * ladderWidth;

      // Calculate rungs (every 30px along the ladder)
      const rungCount = Math.max(3, Math.floor(length / 30));
      const rungs = [];
      for (let i = 1; i < rungCount; i++) {
        const t = i / rungCount;
        const cx = startCoord.x + dx * t;
        const cy = startCoord.y + dy * t;
        rungs.push({
          x1: cx - perpX,
          y1: cy - perpY,
          x2: cx + perpX,
          y2: cy + perpY,
        });
      }

      return (
        <g key={`ladder-${startNum}-${endNum}`} className="pointer-events-none drop-shadow-[3px_4px_0px_#1E1B18]">
          {/* Shadow / outline */}
          <line
            x1={startCoord.x - perpX + 3}
            y1={startCoord.y - perpY + 3}
            x2={endCoord.x - perpX + 3}
            y2={endCoord.y - perpY + 3}
            stroke="#1E1B18"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <line
            x1={startCoord.x + perpX + 3}
            y1={startCoord.y + perpY + 3}
            x2={endCoord.x + perpX + 3}
            y2={endCoord.y + perpY + 3}
            stroke="#1E1B18"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Wooden Rails */}
          <line
            x1={startCoord.x - perpX}
            y1={startCoord.y - perpY}
            x2={endCoord.x - perpX}
            y2={endCoord.y - perpY}
            stroke="#935116"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <line
            x1={startCoord.x + perpX}
            y1={startCoord.y + perpY}
            x2={endCoord.x + perpX}
            y2={endCoord.y + perpY}
            stroke="#935116"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Wooden Rungs */}
          {rungs.map((r, rIdx) => (
            <g key={`rung-${rIdx}`}>
              <line
                x1={r.x1 + 1.5}
                y1={r.y1 + 1.5}
                x2={r.x2 + 1.5}
                y2={r.y2 + 1.5}
                stroke="#1E1B18"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <line
                x1={r.x1}
                y1={r.y1}
                x2={r.x2}
                y2={r.y2}
                stroke="#DDA15E"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </g>
          ))}
        </g>
      );
    });
  };

  // Render Cartoon Snakes
  const renderSnakes = () => {
    return SNAKE_STYLES.map((cfg) => {
      const head = getTileCoordinates(cfg.from);
      const tail = getTileCoordinates(cfg.to);

      const dx = tail.x - head.x;
      const dy = tail.y - head.y;
      const angle = Math.atan2(dy, dx);

      const perpX = -Math.sin(angle);
      const perpY = Math.cos(angle);

      // Bezier curve
      const cp1X = head.x + dx * 0.35 + perpX * cfg.curveFactor;
      const cp1Y = head.y + dy * 0.35 + perpY * cfg.curveFactor;
      const cp2X = head.x + dx * 0.65 - perpX * cfg.curveFactor * 0.7;
      const cp2Y = head.y + dy * 0.65 - perpY * cfg.curveFactor * 0.7;

      const pathData = `M ${head.x} ${head.y} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${tail.x} ${tail.y}`;
      const headAngleDeg = (Math.atan2(cp1Y - head.y, cp1X - head.x) * 180) / Math.PI;

      return (
        <g key={`snake-${cfg.from}-${cfg.to}`} className="pointer-events-none drop-shadow-[4px_5px_0px_#1E1B18]">
          {/* Outer Black Border */}
          <path
            d={pathData}
            fill="none"
            stroke="#1E1B18"
            strokeWidth="26"
            strokeLinecap="round"
          />

          {/* Inner Colored Body */}
          <path
            d={pathData}
            fill="none"
            stroke={cfg.color}
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Spots / Stripes */}
          <path
            d={pathData}
            fill="none"
            stroke={cfg.patternColor}
            strokeWidth="10"
            strokeDasharray="18 20"
            strokeLinecap="round"
          />

          {/* Snake Head */}
          <g transform={`translate(${head.x}, ${head.y}) rotate(${headAngleDeg - 90})`}>
            {/* Tongue */}
            <path
              d="M 0 -15 Q -3 -26 -8 -30 M 0 -15 Q 3 -26 8 -30"
              stroke="#E63946"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />

            {/* Head Base */}
            <ellipse cx="0" cy="0" rx="18" ry="20" fill="#1E1B18" />
            <ellipse cx="0" cy="0" rx="15" ry="17" fill={cfg.color} />

            {/* Eyes */}
            <circle cx="-7" cy="-5" r="6" fill="white" stroke="#1E1B18" strokeWidth="2" />
            <circle cx="-6" cy="-5" r="3" fill="#1E1B18" />
            <circle cx="-7" cy="-6" r="1.5" fill="white" />

            <circle cx="7" cy="-5" r="6" fill="white" stroke="#1E1B18" strokeWidth="2" />
            <circle cx="6" cy="-5" r="3" fill="#1E1B18" />
            <circle cx="5" cy="-6" r="1.5" fill="white" />

            {/* Nostrils */}
            <circle cx="-2.5" cy="-12" r="1.2" fill="#1E1B18" />
            <circle cx="2.5" cy="-12" r="1.2" fill="#1E1B18" />
          </g>

          {/* Tail */}
          <circle cx={tail.x} cy={tail.y} r="7" fill="#1E1B18" />
          <circle cx={tail.x} cy={tail.y} r="4" fill={cfg.patternColor} />
        </g>
      );
    });
  };

  return (
    <svg
      viewBox="0 0 1000 1000"
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      preserveAspectRatio="none"
    >
      {renderLadders()}
      {renderSnakes()}
    </svg>
  );
};
