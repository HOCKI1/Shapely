import React from "react";
import { useCanvasStore } from "../store/canvasStore";
import { Grid3X3, EyeOff } from "lucide-react";

export default function GridToggleButton() {
  const showGrid = useCanvasStore((s) => s.showGrid);
  const toggleGrid = useCanvasStore((s) => s.toggleGrid);

  return (
    <button
      onClick={toggleGrid}
      className="text-gray-600 hover:text-black p-1 rounded hover:bg-gray-100"
      title="Показать/Скрыть сетку"
    >
      {showGrid ? <Grid3X3 size={18} /> : <Grid3X3 size={18} className="opacity-30" />}
    </button>
  );
}
