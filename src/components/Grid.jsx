import React from "react";
import { Line } from "react-konva";
import { useCanvasStore } from "../store/canvasStore";

export default function Grid({ canvasWidth, canvasHeight, scale = 1}) {
  const showGrid = useCanvasStore((s) => s.showGrid);
  const spacing = useCanvasStore((s) => s.gridSpacing); // из store

  if (!showGrid || !canvasWidth || !canvasHeight || spacing <= 0) return null;

  const scaledSpacing = spacing / scale;
  const lines = [];

  for (let x = 0; x <= canvasWidth; x += scaledSpacing) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, canvasHeight]}
        stroke="#777777"
        strokeWidth={0.1}
        listening={false}
      />
    );
  }

  for (let y = 0; y <= canvasHeight; y += scaledSpacing) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, canvasWidth, y]}
        stroke="#777777"
        strokeWidth={0.1}
        listening={false}
      />
    );
  }

  return <>{lines}</>;
}
