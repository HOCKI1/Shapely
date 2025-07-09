import React from "react";
import { useCanvasStore } from "../store/canvasStore";

export default function LayersPanel() {
  const { shapes, selectedId, setSelectedId, reorderShapes } = useCanvasStore();

  const moveUp = (index) => {
    if (index === 0) return; // самый верхний уже
    reorderShapes(index, index - 1);
  };

  const moveDown = (index) => {
    if (index === shapes.length - 1) return; // самый нижний уже
    reorderShapes(index, index + 1);
  };

  return (
    <div className="p-4 w-48">
      <h2 className="text-lg font-semibold mb-2">Слои</h2>
      {shapes.length === 0 ? (
        <p className="text-sm text-neutral-500">Нет объектов</p>
      ) : (
        <ul className="space-y-1">
          {shapes.map((shape, index) => (
            <li
              key={shape.id}
              className={`flex justify-between items-center cursor-pointer px-2 py-1 rounded text-sm ${
                selectedId === shape.id
                  ? "bg-indigo-100 text-indigo-700 font-medium"
                  : "hover:bg-neutral-100"
              }`}
              onClick={() => setSelectedId(shape.id)}
            >
              <span>
                {shape.type === "rectangle"
                  ? "Прямоугольник"
                  : shape.type === "circle"
                  ? "Круг"
                  : shape.type === "triangle"
                  ? "Треугольник"
                  : "Фигура"}
              </span>

              <span className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveUp(index);
                  }}
                  disabled={index === 0}
                  className="px-1 rounded disabled:opacity-50"
                  title="Вверх"
                >
                  ▲
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveDown(index);
                  }}
                  disabled={index === shapes.length - 1}
                  className="px-1 rounded disabled:opacity-50"
                  title="Вниз"
                >
                  ▼
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
