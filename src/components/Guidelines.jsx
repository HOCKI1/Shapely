import React from "react";
import { Line } from "react-konva";
import { useCanvasStore } from "../store/canvasStore";

export default function Guidelines() {
  const { guidelines } = useCanvasStore();

  return (
    <>
      {guidelines.map((line, index) => (
        <Line
          key={index}
          points={line.points}
          stroke="rgba(117, 159, 255, 0.8)"
          strokeWidth={1}
          dash={[4, 4]}
        />
      ))}
    </>
  );
}
