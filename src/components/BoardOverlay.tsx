import React from 'react';
import { LADDERS, SNAKES, getTileCoordinates } from '../utils/board';

interface BoardOverlayProps {
  // SVG overlay spans 1000x1000 viewBox matching the 10x10 tile grid
}

interface SnakeConfig {
  from: number;
  to: number;
  color: string;
  patternColor: string;
  eyeSide: 'left' | 'right';
  curveFactor: number; // offset direction for wavy body
}

const SNAKE_STYLES: SnakeConfig[] = [
  { from: 99, to: 80, color: '#38B000', patternColor: '#CCFF33', eyeSide: 'left', curveFactor: 45 },
  { from: 95, to: 75, color: '#FFB703', patternColor: '#FB8500', eyeSide: 'right', curveFactor: -40 },
  { from: 93, to: 73, color: '#2B9348', patternColor: '#007200', eyeSide: 'left', curveFactor: 35 },
  { from: 89, to: 72, color: '#9D4EDD', patternColor: '#C77DFF', eyeSide: 'right', curveFactor: -50 },
  { from: 74, to: 53, color: '#FF758F', patternColor: '#C9184A', eyeSide: 'left', curveFactor: 55 },
  { from: 64, to: 60, color: '#52B788', patternColor: '#74C69D', eyeSide: 'right', curveFactor: -30 },
  { from: 62, to: 19, color: '#A06CD5', patternColor: '#E2C2FF', eyeSide: 'left', curveFactor: 75 },
  { from: 49, to: 11, color: '#FFD166', patternColor: '#1E1B18', eyeSide: 'right', curveFactor: -85 },
  { from: 47, to: 25, color: '#EF476F', patternColor: '#FFD166', eyeSide: 'left', curveFactor: 60 },
  { from: 16, to: 6, color: '#06D6A0', patternColor: '#118AB2', eyeSide: 'right', curveFactor: -40 },
];

export const BoardOverlay: React.FC<BoardOverlayProps> = () => {
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
      const ladderWidth = 14;
      const perpX = -Math.sin(angle) * ladderWidth;
      const perpY = Math.cos(angle) * ladderWidth;

      // Calculate rungs (every 22px along the ladder)
      const rungCount = Math.max(3, Math.floor(length / 22));
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
        <g key={`ladder-${startNum}-${endNum}`} className="pointer-events-none drop-shadow-[2px_3px_0px_#1E1B18]">
          {/* Shadow / outline */}
          <line
            x1={startCoord.x - perpX + 2}
            y1={startCoord.y - perpY + 2}
            x2={endCoord.x - perpX + 2}
            y2={endCoord.y - perpY + 2}
            stroke="#1E1B18"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <line
            x1={startCoord.x + perpX + 2}
            y1={startCoord.y + perpY + 2}
            x2={endCoord.x + perpX + 2}
            y2={endCoord.y + perpY + 2}
            stroke="#1E1B18"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Wooden Rails */}
          <line
            x1={startCoord.x - perpX}
            y1={startCoord.y - perpY}
            x2={endCoord.x - perpX}
            y2={endCoord.y - perpY}
            stroke="#A05A2C"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line
            x1={startCoord.x + perpX}
            y1={startCoord.y + perpY}
            x2={endCoord.x + perpX}
            y2={endCoord.y + perpY}
            stroke="#A05A2C"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Wooden Rungs */}
          {rungs.map((r, rIdx) => (
            <g key={`rung-${rIdx}`}>
              <line
                x1={r.x1 + 1}
                y1={r.y1 + 1}
                x2={r.x2 + 1}
                y2={r.y2 + 1}
                stroke="#1E1B18"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <line
                x1={r.x1}
                y1={r.y1}
                x2={r.x2}
                y2={r.y2}
                stroke="#DDA15E"
                strokeWidth="4"
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
      const length = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      // Perpendicular vector
      const perpX = -Math.sin(angle);
      const perpY = Math.cos(angle);

      // Generate curvy S-shaped Bezier path for the snake body
      const cp1X = head.x + dx * 0.33 + perpX * cfg.curveFactor;
      const cp1Y = head.y + dy * 0.33 + perpY * cfg.curveFactor;
      const cp2X = head.x + dx * 0.66 - perpX * cfg.curveFactor * 0.8;
      const cp2Y = head.y + dy * 0.66 - perpY * cfg.curveFactor * 0.8;

      const pathData = `M ${head.x} ${head.y} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${tail.x} ${tail.y}`;

      // Head angle calculation
      const headAngleDeg = (Math.atan2(cp1Y - head.y, cp1X - head.x) * 180) / Math.PI;

      return (
        <g key={`snake-${cfg.from}-${cfg.to}`} className="pointer-events-none drop-shadow-[3px_4px_0px_#1E1B18]">
          {/* Black Outline of the snake body */}
          <path
            d={pathData}
            fill="none"
            stroke="#1E1B18"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Main Colored Body */}
          <path
            d={pathData}
            fill="none"
            stroke={cfg.color}
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Pattern / Stripes on the body */}
          <path
            d={pathData}
            fill="none"
            stroke={cfg.patternColor}
            strokeWidth="8"
            strokeDasharray="14 16"
            strokeLinecap="round"
          />

          {/* Snake Head Group */}
          <g transform={`translate(${head.x}, ${head.y}) rotate(${headAngleDeg - 90})`}>
            {/* Tongue */}
            <path
              d="M 0 -12 Q -2 -22 -6 -26 M 0 -12 Q 2 -22 6 -26"
              stroke="#E63946"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />

            {/* Head Base Outline */}
            <ellipse cx="0" cy="0" rx="14" ry="16" fill="#1E1B18" />
            <ellipse cx="0" cy="0" rx="12" ry="14" fill={cfg.color} />

            {/* Left Eye */}
            <circle cx="-6" cy="-4" r="5" fill="white" stroke="#1E1B18" strokeWidth="1.5" />
            <circle cx="-5" cy="-4" r="2.5" fill="#1E1B18" />
            <circle cx="-6" cy="-5" r="1" fill="white" />

            {/* Right Eye */}
            <circle cx="6" cy="-4" r="5" fill="white" stroke="#1E1B18" strokeWidth="1.5" />
            <circle cx="5" cy="-4" r="2.5" fill="#1E1B18" />
            <circle cx="4" cy="-5" r="1" fill="white" />

            {/* Cute Nostrils */}
            <circle cx="-2" cy="-10" r="1" fill="#1E1B18" />
            <circle cx="2" cy="-10" r="1" fill="#1E1B18" />
          </g>

          {/* Snake Tail Tip */}
          <circle cx={tail.x} cy={tail.y} r="5" fill="#1E1B18" />
          <circle cx={tail.x} cy={tail.y} r="3" fill={cfg.patternColor} />
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
      {/* 1. Ladders rendered beneath snakes */}
      {renderLadders()}

      {/* 2. Cartoon Snakes rendered on top */}
      {renderSnakes()}
    </svg>
  );
};
