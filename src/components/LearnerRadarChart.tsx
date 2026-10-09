import React from 'react';
import { LearnerRadarScores } from '../types';

interface LearnerRadarChartProps {
  scores: LearnerRadarScores;
  size?: number;
  className?: string;
  showLabels?: boolean;
}

export const LearnerRadarChart: React.FC<LearnerRadarChartProps> = ({
  scores,
  size = 240,
  className = '',
  showLabels = true,
}) => {
  const center = size / 2;
  const radius = size * 0.36; // radius of the outermost grid diamond

  // Grid levels (e.g. 25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Helper to get point on 4 axes:
  // Top: Memory (0, -r)
  // Right: Comprehension (r, 0)
  // Bottom: Application (0, r)
  // Left: Analysis (-r, 0)
  const getCoordinates = (value: number, axis: 'top' | 'right' | 'bottom' | 'left') => {
    const r = (value / 100) * radius;
    switch (axis) {
      case 'top':
        return { x: center, y: center - r };
      case 'right':
        return { x: center + r, y: center };
      case 'bottom':
        return { x: center, y: center + r };
      case 'left':
        return { x: center - r, y: center };
    }
  };

  // Compute 4 polygon vertices from real user scores
  const pTop = getCoordinates(scores.memory, 'top');
  const pRight = getCoordinates(scores.comprehension, 'right');
  const pBottom = getCoordinates(scores.application, 'bottom');
  const pLeft = getCoordinates(scores.analysis, 'left');

  const polygonPoints = `${pTop.x},${pTop.y} ${pRight.x},${pRight.y} ${pBottom.x},${pBottom.y} ${pLeft.x},${pLeft.y}`;

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background diamond grids */}
        {levels.map((lvl, idx) => {
          const r = lvl * radius;
          const pts = `${center},${center - r} ${center + r},${center} ${center},${center + r} ${center - r},${center}`;
          return (
            <polygon
              key={idx}
              points={pts}
              fill="none"
              stroke="#DCE5E0"
              strokeWidth="1"
              className="transition-all duration-300"
            />
          );
        })}

        {/* Cross Axis lines */}
        <line
          x1={center}
          y1={center - radius}
          x2={center}
          y2={center + radius}
          stroke="#DCE5E0"
          strokeWidth="1"
        />
        <line
          x1={center - radius}
          y1={center}
          x2={center + radius}
          y2={center}
          stroke="#DCE5E0"
          strokeWidth="1"
        />

        {/* Dynamic Filled Polygon Area */}
        <polygon
          points={polygonPoints}
          fill="rgba(39, 90, 68, 0.16)"
          stroke="#275A44"
          strokeWidth="2"
          strokeLinejoin="round"
          className="transition-all duration-500 ease-out"
        />

        {/* 4 Vertex Solid Circle Markers */}
        <circle cx={pTop.x} cy={pTop.y} r="3.5" fill="#275A44" className="transition-all duration-500 ease-out" />
        <circle cx={pRight.x} cy={pRight.y} r="3.5" fill="#275A44" className="transition-all duration-500 ease-out" />
        <circle cx={pBottom.x} cy={pBottom.y} r="3.5" fill="#275A44" className="transition-all duration-500 ease-out" />
        <circle cx={pLeft.x} cy={pLeft.y} r="3.5" fill="#275A44" className="transition-all duration-500 ease-out" />
      </svg>

      {/* 4 Labels placed accurately matching screenshot */}
      {showLabels && (
        <>
          {/* Top: 记忆型 */}
          <div
            className="absolute text-xs font-medium text-stone-500 tracking-wide text-center"
            style={{ top: center - radius - 24, left: '50%', transform: 'translateX(-50%)' }}
          >
            记忆型
          </div>

          {/* Right: 理解型 */}
          <div
            className="absolute text-xs font-medium text-stone-500 tracking-wide"
            style={{ right: center - radius - 46, top: '50%', transform: 'translateY(-50%)' }}
          >
            理解型
          </div>

          {/* Bottom: 应用型 */}
          <div
            className="absolute text-xs font-medium text-stone-500 tracking-wide text-center"
            style={{ bottom: center - radius - 24, left: '50%', transform: 'translateX(-50%)' }}
          >
            应用型
          </div>

          {/* Left: 分析型 */}
          <div
            className="absolute text-xs font-medium text-stone-500 tracking-wide"
            style={{ left: center - radius - 46, top: '50%', transform: 'translateY(-50%)' }}
          >
            分析型
          </div>
        </>
      )}
    </div>
  );
};
