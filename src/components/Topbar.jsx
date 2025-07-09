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

  const exportImage = async (mimeType = "image/png", filename = "canvas.png") => {
    const prevShowGrid = showGrid;
    setShowGrid(false);
    await new Promise((resolve) => requestAnimationFrame(resolve));

    if (!stageRef.current) {
      alert("Сцена не готова для экспорта");
      setMenuOpen(false);
      setShowGrid(prevShowGrid);
      return;
    }

    const uri = stageRef.current.toDataURL({ mimeType });
    downloadURI(uri, filename);

    setShowGrid(prevShowGrid);
    setMenuOpen(false);
  };

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
                    onClick={() => exportImage("image/png", "canvas.png")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Сохранить PNG
                  </button>
                  <button
                    onClick={() => exportImage("image/jpeg", "canvas.jpeg")}
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
