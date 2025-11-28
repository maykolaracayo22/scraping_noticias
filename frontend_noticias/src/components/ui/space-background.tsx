// components/ui/interactive-grid-pattern.tsx
"use client";

import { useState, useEffect } from "react";

interface InteractiveGridPatternProps {
  width?: number;
  height?: number;
  squares?: [number, number];
  className?: string;
}

export function InteractiveGridPattern({
  width = 40,
  height = 40,
  squares = [20, 15],
  className,
}: InteractiveGridPatternProps) {
  const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div 
        className="absolute inset-0 grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${squares[0]}, 1fr)`,
          gridTemplateRows: `repeat(${squares[1]}, 1fr)`,
        }}
      >
        {Array.from({ length: squares[0] * squares[1] }).map((_, index) => {
          const isHovered = hoveredSquare === index;
          return (
            <div
              key={index}
              className={`border border-blue-200/30 transition-all duration-500 ease-out ${
                isHovered 
                  ? 'bg-blue-400/40 scale-110' 
                  : 'bg-blue-100/20 hover:bg-blue-200/30'
              }`}
              style={{
                width: `${width}px`,
                height: `${height}px`,
              }}
              onMouseEnter={() => setHoveredSquare(index)}
              onMouseLeave={() => setHoveredSquare(null)}
            />
          );
        })}
      </div>
    </div>
  );
}