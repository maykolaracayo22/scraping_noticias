"use client";

import React, { useState } from "react";

interface InteractiveGridPatternProps {
  width?: number;
  height?: number;
  squares?: [number, number];
  className?: string;
}

export function InteractiveGridPattern({
  width = 30,
  height = 30,
  squares = [25, 15],
  className,
}: InteractiveGridPatternProps) {
  const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div 
        className="absolute inset-0 grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${squares[0]}, 1fr)`,
          gridTemplateRows: `repeat(${squares[1]}, 1fr)`,
        }}
      >
        {Array.from({ length: squares[0] * squares[1] }).map((_, i) => {
          const isHovered = hoveredSquare === i;
          return (
            <div
              key={i}
              className={`border border-blue-200/20 transition-all duration-300 ease-in-out ${
                isHovered ? 'bg-blue-400/30' : 'bg-transparent'
              }`}
              style={{
                width: `${width}px`,
                height: `${height}px`,
              }}
              onMouseEnter={() => setHoveredSquare(i)}
              onMouseLeave={() => setHoveredSquare(null)}
            />
          );
        })}
      </div>
    </div>
  );
}