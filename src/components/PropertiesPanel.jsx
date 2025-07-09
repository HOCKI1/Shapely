import React from "react";
import { useCanvasStore } from "../store/canvasStore";

export default function PropertiesPanel() {
  const { selectedId, shapes, updateShape } = useCanvasStore();
  const shape = shapes.find((s) => s.id === selectedId);

  if (!shape)
    return (
      <div className="p-4 text-sm text-neutral-500">Ничего не выбрано</div>
    );

  return (
    <div className="p-4 space-y-3 text-sm">
      <h2 className="text-lg font-semibold mb-2">Свойства</h2>

      {/* X / Y */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block">X</label>
          <input
            type="number"
            value={shape.x}
            onChange={(e) => updateShape(shape.id, { x: +e.target.value })}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="flex-1">
          <label className="block">Y</label>
          <input
            type="number"
            value={shape.y}
            onChange={(e) => updateShape(shape.id, { y: +e.target.value })}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Size */}
      {shape.type === "rectangle" && (
        <>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block">Ширина</label>
              <input
                type="number"
                value={shape.width}
                onChange={(e) =>
                  updateShape(shape.id, { width: +e.target.value })
                }
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div className="flex-1">
              <label className="block">Высота</label>
              <input
                type="number"
                value={shape.height}
                onChange={(e) =>
                  updateShape(shape.id, { height: +e.target.value })
                }
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>

          {/* Скругления углов */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={shape.cornerRadiusTopLeft || 0}
                onChange={(e) =>
                  updateShape(shape.id, {
                    cornerRadiusTopLeft: Math.max(0, +e.target.value),
                  })
                }
                className="w-full border rounded px-2 py-1"
              />
              <span className="text-xl" title="Скругление сверху слева">
                ⌜
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl" title="Скругление сверху справа">
                ⌝
              </span>
              <input
                type="number"
                value={shape.cornerRadiusTopRight || 0}
                onChange={(e) =>
                  updateShape(shape.id, {
                    cornerRadiusTopRight: Math.max(0, +e.target.value),
                  })
                }
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={shape.cornerRadiusBottomLeft || 0}
                onChange={(e) =>
                  updateShape(shape.id, {
                    cornerRadiusBottomLeft: Math.max(0, +e.target.value),
                  })
                }
                className="w-full border rounded px-2 py-1"
              />
              <span className="text-xl" title="Скругление снизу слева">
                ⌞
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl" title="Скругление снизу справа">
                ⌟
              </span>
              <input
                type="number"
                value={shape.cornerRadiusBottomRight || 0}
                onChange={(e) =>
                  updateShape(shape.id, {
                    cornerRadiusBottomRight: Math.max(0, +e.target.value),
                  })
                }
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>
        </>
      )}

      {shape.type === "triangle" &&
        shape.points.map((point, index) => (
          <div key={index} className="mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Точка {index + 1}
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={point.x}
                onChange={(e) => {
                  const updatedPoints = [...selectedShape.points];
                  updatedPoints[index].x = parseFloat(e.target.value);
                  updateShape(selectedShape.id, { points: updatedPoints });
                }}
                className="w-1/2 border px-2 py-1 rounded"
              />
              <input
                type="number"
                value={point.y}
                onChange={(e) => {
                  const updatedPoints = [...selectedShape.points];
                  updatedPoints[index].y = parseFloat(e.target.value);
                  updateShape(selectedShape.id, { points: updatedPoints });
                }}
                className="w-1/2 border px-2 py-1 rounded"
              />
            </div>
          </div>
        ))}

      {shape.type === "triangle" && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col">
              <label className="block text-xs text-gray-500">
                Скругление {i + 1}
              </label>
              <input
                type="number"
                value={shape.cornerRadii?.[i] || 0}
                onChange={(e) => {
                  const newRadii = [...(shape.cornerRadii || [0, 0, 0])];
                  newRadii[i] = Math.max(0, +e.target.value);
                  updateShape(shape.id, { cornerRadii: newRadii });
                }}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
          ))}
        </div>
      )}

      {/* Circle */}

      {shape.type === "circle" && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="flex flex-col">
            <label className="block text-xs text-gray-500">Ширина</label>
            <input
              type="number"
              value={shape.radiusX * 2}
              onChange={(e) =>
                updateShape(shape.id, {
                  radiusX: Math.max(1, +e.target.value / 2),
                })
              }
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs text-gray-500">Высота</label>
            <input
              type="number"
              value={shape.radiusY * 2}
              onChange={(e) =>
                updateShape(shape.id, {
                  radiusY: Math.max(1, +e.target.value / 2),
                })
              }
              className="w-full border px-2 py-1 rounded"
            />
          </div>
        </div>
      )}

      {/* Fill */}
      <div>
        <label className="block">Цвет</label>
        <input
          type="color"
          value={shape.fill}
          onChange={(e) => updateShape(shape.id, { fill: e.target.value })}
          className="w-full h-10 p-0 border rounded"
        />
      </div>

      {/* Rotation */}
      {shape.type !== "triangle" && (
        <div>
          <label className="block">Поворот (°)</label>
          <input
            type="number"
            value={shape.rotation || 0}
            onChange={(e) =>
              updateShape(shape.id, { rotation: +e.target.value })
            }
            className="w-full border rounded px-2 py-1"
          />
        </div>
      )}

      {/* Opacity */}
      <div>
        <label className="block">Прозрачность (0-1)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={shape.opacity ?? 1}
          onChange={(e) =>
            updateShape(shape.id, {
              opacity: Math.max(0, Math.min(1, +e.target.value)),
            })
          }
          className="w-full border rounded px-2 py-1"
        />
      </div>
    </div>
  );
}
