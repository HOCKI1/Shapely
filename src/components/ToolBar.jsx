import React from "react";
import { useCanvasStore } from "../store/canvasStore";
import {
  Square,
  Circle,
  Pencil,
  Slash,
  Triangle,
} from "lucide-react";

const tools = [
  { name: "rectangle", icon: <Square size={28} />, label: "Прямоугольник" },
  { name: "circle", icon: <Circle size={28} />, label: "Круг" },
  { name: "line", icon: <Slash size={28} />, label: "Линия" },
  { name: "polyline", icon: <Pencil size={28} />, label: "Полилиния" },
  { name: "triangle", icon: <Triangle size={28} />, label: "Треугольник" },
];

export default function Toolbar() {
  const activeTool = useCanvasStore((s) => s.activeTool);
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);

  return (
    <div className="flex flex-col items-center gap-2">
      {tools.map((tool) => (
        <button
          key={tool.name}
          onClick={() => setActiveTool(tool.name)}
          title={tool.label}
          className={`w-[60px] h-[60px] flex items-center justify-center rounded transition
            ${
              activeTool === tool.name
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100 text-gray-600"
            }`}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}
