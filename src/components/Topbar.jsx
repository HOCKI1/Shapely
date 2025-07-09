import React, { useState } from "react";
import CreateFileModal from "./CreateFileModal";
import GridToggleButton from "./GridToggleButton";
import { useCanvasStore } from "../store/canvasStore";
import GridSpacingInput from "./GridSpacingInput";
import { HiLockClosed, HiLockOpen } from "react-icons/hi";

export default function Topbar({ stageRef }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const createNewFile = useCanvasStore((s) => s.createNewFile);
  const snapEnabled = useCanvasStore((s) => s.snapEnabled);
  const toggleSnapEnabled = useCanvasStore((s) => s.toggleSnapEnabled);
  const showGrid = useCanvasStore((s) => s.showGrid);
  const setShowGrid = useCanvasStore((s) => s.setShowGrid);

  const downloadURI = (uri, name) => {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportImage = async (
  mimeType = "image/png",
  filename = "canvas.png"
) => {
  const prevShowGrid = showGrid;
  setShowGrid(false);
  await new Promise((resolve) => requestAnimationFrame(resolve));

  if (!stageRef.current) {
    alert("Сцена не готова для экспорта");
    setMenuOpen(false);
    setShowGrid(prevShowGrid);
    return;
  }

  const shapes = useCanvasStore.getState().shapes;
  const canvasWidth = useCanvasStore.getState().width;
  const canvasHeight = useCanvasStore.getState().height;

  console.log("📐 Canvas Size:", {
    width: canvasWidth,
    height: canvasHeight,
  });
  console.log("🧩 Shapes:", JSON.stringify(shapes, null, 2));

  const uri = stageRef.current.toDataURL({ mimeType });
  downloadURI(uri, filename);

  setShowGrid(prevShowGrid);
  setMenuOpen(false);
};

// функция экспорта фона
const exportFullImage = () => {
const { width, height, bgColor } = useCanvasStore.getState();

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Фон: белый / чёрный / прозрачный
  if (bgColor === "#ffffff" || bgColor === "#000000" || bgColor === "white" || bgColor === "black") {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
  }

  const shapes = [...useCanvasStore.getState().shapes].reverse();


  // Отрисовка фигур
  shapes.forEach((shape) => {
    ctx.save();
    ctx.translate(shape.x, shape.y);
    ctx.rotate((shape.rotation || 0) * Math.PI / 180);

    if (shape.type === "rectangle") {
      drawRoundedRect(ctx, shape);
    } else if (shape.type === "circle") {
      drawCircle(ctx, shape);
    } else if (shape.type === "triangle") {
      drawTriangle(ctx, shape);
    }

    ctx.restore();
  });

  const dataURL = canvas.toDataURL("image/png");
  downloadURI(dataURL, "canvas_rendered.png");
  setMenuOpen(false);
};

function drawRoundedRect(ctx, shape) {
  const {
    width,
    height,
    fill,
    stroke,
    strokeWidth = 0,
    cornerRadiusTopLeft = 0,
    cornerRadiusTopRight = 0,
    cornerRadiusBottomRight = 0,
    cornerRadiusBottomLeft = 0,
  } = shape;

  const w = width;
  const h = height;

  const tl = Math.min(cornerRadiusTopLeft, w / 2, h / 2);
  const tr = Math.min(cornerRadiusTopRight, w / 2, h / 2);
  const br = Math.min(cornerRadiusBottomRight, w / 2, h / 2);
  const bl = Math.min(cornerRadiusBottomLeft, w / 2, h / 2);

  ctx.beginPath();
  ctx.moveTo(-w / 2 + tl, -h / 2);

  ctx.lineTo(w / 2 - tr, -h / 2);
  ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + tr);

  ctx.lineTo(w / 2, h / 2 - br);
  ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - br, h / 2);

  ctx.lineTo(-w / 2 + bl, h / 2);
  ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - bl);

  ctx.lineTo(-w / 2, -h / 2 + tl);
  ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + tl, -h / 2);

  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}


function drawCircle(ctx, shape) {
  const {
    radiusX,
    radiusY,
    fill,
    stroke,
    strokeWidth = 0,
    rotation = 0,
  } = shape;

  ctx.save(); // сохранить текущую трансформацию
  ctx.beginPath();

  ctx.ellipse(
    0, // x (относительно центра)
    0, // y
    radiusX,
    radiusY,
    (rotation * Math.PI) / 180,
    0,
    Math.PI * 2
  );

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }

  ctx.restore(); // восстановить трансформацию
}

function drawTriangle(ctx, shape) {
  const { points, cornerRadii = [0, 0, 0], fill, stroke, strokeWidth = 0 } = shape;
  if (!points || points.length !== 3) return;

  const [p0, p1, p2] = points;
  const [r0, r1, r2] = cornerRadii;

  const getCorner = (p0, p1, p2, radius) => {
    const v1 = { x: p0.x - p1.x, y: p0.y - p1.y };
    const v2 = { x: p2.x - p1.x, y: p2.y - p1.y };

    const len1 = Math.hypot(v1.x, v1.y);
    const len2 = Math.hypot(v2.x, v2.y);

    const norm1 = { x: v1.x / len1, y: v1.y / len1 };
    const norm2 = { x: v2.x / len2, y: v2.y / len2 };

    const angle = Math.acos(norm1.x * norm2.x + norm1.y * norm2.y);
    const tangent = radius / Math.tan(angle / 2);

    const pA = {
      x: p1.x + norm1.x * tangent,
      y: p1.y + norm1.y * tangent,
    };
    const pB = {
      x: p1.x + norm2.x * tangent,
      y: p1.y + norm2.y * tangent,
    };

    return { pA, pB, center: p1 };
  };

  const { pA: p0a, pB: p0b } = getCorner(p2, p0, p1, r0);
  const { pA: p1a, pB: p1b } = getCorner(p0, p1, p2, r1);
  const { pA: p2a, pB: p2b } = getCorner(p1, p2, p0, r2);

  ctx.beginPath();
  ctx.moveTo(p0b.x, p0b.y);
  ctx.lineTo(p1a.x, p1a.y);
  ctx.quadraticCurveTo(p1.x, p1.y, p1b.x, p1b.y);
  ctx.lineTo(p2a.x, p2a.y);
  ctx.quadraticCurveTo(p2.x, p2.y, p2b.x, p2b.y);
  ctx.lineTo(p0a.x, p0a.y);
  ctx.quadraticCurveTo(p0.x, p0.y, p0b.x, p0b.y);
  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}



  const exportProjectJSON = () => {
    const shapes = useCanvasStore.getState().shapes;
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(shapes, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "canvas_project.json");
    link.click();
    setMenuOpen(false);
  };

  return (
    <>
      <div className="h-12 w-full flex items-center justify-between px-4 border-b border-gray-300 bg-white relative z-10">
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-sm font-medium px-3 py-1 rounded hover:bg-gray-100 transition"
          >
            Файл
          </button>

          {menuOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-md z-20">
              <button
                onClick={() => {
                  setModalOpen(true);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Создать
              </button>

              <div className="border-t border-gray-200 my-1" />

              <div className="group relative">
                <div className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer w-full text-left">
                  Экспорт
                </div>
                <div className="hidden group-hover:block absolute top-0 left-full ml-1 w-48 bg-white border border-gray-200 rounded shadow-md z-30">
                  <button
                    // onClick={() => exportImage("image/png", "canvas.png")}
                    onClick={exportFullImage}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Сохранить PNG
                  </button>
                  <button
                    onClick={exportFullImage}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Сохранить JPEG
                  </button>
                  <button
                    onClick={exportProjectJSON}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Сохранить как проект
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-4">
          <GridSpacingInput />
        </div>
        <div className="flex items-center gap-2">
          <GridToggleButton />
        </div>
        <button
          onClick={toggleSnapEnabled}
          className={`flex items-center px-2 py-1 border rounded text-sm transition ${
            snapEnabled
              ? "bg-indigo-100 border-indigo-300 text-indigo-700"
              : "bg-gray-100 border-gray-300 text-gray-600"
          }`}
        >
          {snapEnabled ? (
            <HiLockClosed className="w-4 h-4 mr-1" />
          ) : (
            <HiLockOpen className="w-4 h-4 mr-1" />
          )}
          {snapEnabled ? "Привязки вкл." : "Привязки выкл."}
        </button>
      </div>

      {modalOpen && (
        <CreateFileModal
          onClose={() => setModalOpen(false)}
          onCreate={(config) => {
            createNewFile(config);
            setModalOpen(false);
          }}
        />
      )}
    </>
  );
}
