import React, { useRef } from "react";
import Topbar from "./Topbar";
import Canvas from "./Canvas";
import Toolbar from "./ToolBar";
import PropertiesPanel from "./PropertiesPanel";
import LayersPanel from "./LayersPanel";

export default function UIPanelLayout() {
  const stageRef = useRef(null);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Верхняя панель */}
      <Topbar stageRef={stageRef} />

      {/* Основная рабочая область */}
      <div className="flex flex-1 overflow-hidden">
        {/* Левая панель */}
        <div className="w-[80px] border-r border-gray-300 bg-white p-2 flex flex-col items-center">
          <Toolbar />
        </div>

        {/* Центр */}
        <div className="flex-1 relative bg-neutral-200 overflow-hidden">
          <Canvas stageRef={stageRef} />
        </div>

        {/* Правая панель */}
        <div className="w-[300px] border-l border-gray-300 bg-white flex flex-col">
          <div className="flex-1 border-b border-neutral-200 overflow-auto">
            <PropertiesPanel />
          </div>
          <div className="h-[300px] overflow-auto">
            <LayersPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
