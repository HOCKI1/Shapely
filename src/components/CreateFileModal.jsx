import React, { useState } from "react";
import { useCanvasStore } from "../store/canvasStore";

export default function CreateFileModal({ onClose, onCreate }) {
  const [bgColor, setBgColor] = useState("white");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const createNewFile = useCanvasStore((s) => s.createNewFile);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4">Новый файл</h2>

        <label className="block text-sm font-medium mb-1">Цвет фона</label>
        <select
          className="w-full mb-4 border rounded px-3 py-2 text-sm"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
        >
          <option value="white">Белый</option>
          <option value="black">Чёрный</option>
          <option value="transparent">Прозрачный</option>
        </select>

        <label className="block text-sm font-medium mb-1">Размеры (px)</label>
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            className="w-1/2 border rounded px-3 py-2 text-sm"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            min={1}
          />
          <input
            type="number"
            className="w-1/2 border rounded px-3 py-2 text-sm"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            min={1}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              createNewFile({ width, height, bgColor });
              onClose();
            }}
            className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
}
