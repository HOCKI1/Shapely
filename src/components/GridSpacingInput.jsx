import React from "react";
import { useCanvasStore } from "../store/canvasStore";

export default function GridSpacingInput() {
  const gridSpacing = useCanvasStore((s) => s.gridSpacing);
  const setGridSpacing = useCanvasStore((s) => s.setGridSpacing);

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500">Размер сетки</label>
      <input
        type="number"
        className="w-20 border rounded px-2 py-1 text-sm"
        value={gridSpacing}
        onChange={(e) => setGridSpacing(Number(e.target.value))}
        min={1}
        max={1000}
      />
    </div>
  );
}
