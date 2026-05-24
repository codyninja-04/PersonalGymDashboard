"use client";

import { useMemo } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  showDot?: boolean;
}

export function Sparkline({
  data,
  width = 120,
  height = 36,
  stroke = "var(--color-accent-secondary)",
  fill,
  strokeWidth = 1.6,
  showDot = true,
}: SparklineProps) {
  const { path, area, last } = useMemo(() => {
    if (data.length === 0) return { path: "", area: "", last: { x: 0, y: 0 } };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = data.length > 1 ? width / (data.length - 1) : 0;
    const points = data.map((v, i) => {
      const x = i * stepX;
      const y = height - 4 - ((v - min) / range) * (height - 8);
      return { x, y };
    });
    const path = points
      .map((p, i) => (i === 0 ? `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}` : `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`))
      .join(" ");
    const area = `${path} L ${width} ${height} L 0 ${height} Z`;
    return { path, area, last: points[points.length - 1] };
  }, [data, width, height]);

  if (data.length === 0) return null;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {fill && <path d={area} fill={fill} opacity="0.18" />}
      <path d={path} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
      {showDot && (
        <circle cx={last.x} cy={last.y} r="2.5" fill={stroke}>
          <animate attributeName="r" values="2.5;4.5;2.5" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}
