"use client";

import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";
import type { EmotionalArcPoint } from "@/lib/emotion-intelligence";

interface EmotionalArcTimelineProps {
  arcPoints: EmotionalArcPoint[];
  currentPosition?: number; // 0-1, playback position in song
}

export function EmotionalArcTimeline({ arcPoints, currentPosition }: EmotionalArcTimelineProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);

  if (arcPoints.length === 0) {
    return null;
  }

  const width = 100; // SVG viewbox percentage
  const height = 60;
  const padding = { left: 8, right: 8, top: 8, bottom: 16 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const getX = (position: number) => padding.left + position * plotWidth;
  const getY = (value: number) => padding.top + (1 - value) * plotHeight;

  // Generate SVG path for a dimension
  const makePath = (getValue: (p: EmotionalArcPoint) => number): string => {
    if (arcPoints.length < 2) {
      const p = arcPoints[0];
      const x = getX(p.position);
      const y = getY(getValue(p));
      return `M ${x} ${y} L ${x + 1} ${y}`;
    }

    const points = arcPoints.map(p => ({
      x: getX(p.position),
      y: getY(getValue(p)),
    }));

    // Smooth curve through points
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      path += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return path;
  };

  const tensionPath = makePath(p => p.tension);
  const energyPath = makePath(p => p.energy);
  const valencePath = makePath(p => p.valence);

  const tensionColor = "#E74C3C";
  const energyColor = "#F39C12";
  const valenceColor = "#2ECC71";

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ backgroundColor: tc.panelBg, borderColor: tc.panelBorder }}
    >
      <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
        <span className="vintage-label">EMOTIONAL ARC</span>
        <div className="flex items-center gap-3">
          {[
            { label: "Tension", color: tensionColor },
            { label: "Energy", color: energyColor },
            { label: "Valence", color: valenceColor },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className="w-2 h-1 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-[0.45rem] font-mono" style={{ color: tc.textMuted }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-2 pb-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ height: "80px" }}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(v => (
            <line
              key={v}
              x1={padding.left}
              y1={getY(v)}
              x2={width - padding.right}
              y2={getY(v)}
              stroke={tc.panelBorder}
              strokeWidth="0.3"
              strokeDasharray="1 1"
            />
          ))}

          {/* Tension line */}
          <path d={tensionPath} fill="none" stroke={tensionColor} strokeWidth="1" opacity="0.8" />
          {/* Energy line */}
          <path d={energyPath} fill="none" stroke={energyColor} strokeWidth="1" opacity="0.8" />
          {/* Valence line */}
          <path d={valencePath} fill="none" stroke={valenceColor} strokeWidth="1" opacity="0.8" />

          {/* Data points and labels */}
          {arcPoints.map((point, i) => {
            const x = getX(point.position);
            return (
              <g key={i}>
                {/* Vertical section line */}
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke={tc.panelBorder}
                  strokeWidth="0.3"
                  strokeDasharray="0.5 0.5"
                />
                {/* Dots */}
                <circle cx={x} cy={getY(point.tension)} r="1.2" fill={tensionColor} />
                <circle cx={x} cy={getY(point.energy)} r="1.2" fill={energyColor} />
                <circle cx={x} cy={getY(point.valence)} r="1.2" fill={valenceColor} />
                {/* Label */}
                <text
                  x={x}
                  y={height - 4}
                  textAnchor="middle"
                  fill={tc.textMuted}
                  fontSize="3"
                  fontFamily="monospace"
                >
                  {point.label.length > 12 ? point.label.slice(0, 12) + "..." : point.label}
                </text>
              </g>
            );
          })}

          {/* Playback position indicator */}
          {currentPosition !== undefined && currentPosition >= 0 && currentPosition <= 1 && (
            <line
              x1={getX(currentPosition)}
              y1={padding.top - 2}
              x2={getX(currentPosition)}
              y2={height - padding.bottom + 2}
              stroke={tc.textAccent}
              strokeWidth="0.6"
              opacity="0.9"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
