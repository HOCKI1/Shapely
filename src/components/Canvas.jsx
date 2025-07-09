import React, { useEffect, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Transformer,
} from "react-konva";
import { useCanvasStore } from "../store/canvasStore";
import Grid from "./Grid";
import RectangleShape from "./shapes/RectangleShape";
import CircleShape from "./shapes/CircleShape";
import TriangleShape from "./shapes/TriangleShape";
import Guidelines from "./Guidelines";

const PADDING = 32;

export default function Canvas({ stageRef }) {
  const containerRef = useRef(null);
  const transformerRef = useRef();

  const {
    width,
    height,
    bgColor,
    isCreated,
    shapes,
    addShape,
    activeTool,
    showGrid,
    gridSpacing,
    selectedId,
    setSelectedId,
    updateShape,
    removeShape,
  } = useCanvasStore();

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const isPanning = useRef(false);
  const lastPointerPos = useRef(null);
  const mouseDownPos = useRef(null);
  const wasDeselected = useRef(false);
  const wasEmptyClick = useRef(true);


  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isCreated) return;

    const availableWidth = container.clientWidth - PADDING * 2;
    const availableHeight = container.clientHeight - PADDING * 2;

    const scaleX = availableWidth / width;
    const scaleY = availableHeight / height;
    const newScale = Math.min(scaleX, scaleY);

    setScale(newScale);
    setStageSize({
      width: container.clientWidth,
      height: container.clientHeight,
    });

    setPosition({
      x: container.clientWidth / 2 - (width * newScale) / 2,
      y: container.clientHeight / 2 - (height * newScale) / 2,
    });
  }, [width, height, isCreated]);

  useEffect(() => {
    if (!stageRef?.current || !transformerRef.current) return;

    const node = stageRef.current.findOne(`#${selectedId}`);
    if (!node) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
      return;
    }

    const isShape = ["Rect", "Ellipse", "Circle", "Path"].includes(
      node.getClassName()
    );

    if (isShape) {
      transformerRef.current.nodes([node]);
    } else {
      transformerRef.current.nodes([]);
    }
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedId, shapes, stageRef]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const active = document.activeElement;
      const isInputFocused =
        active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.isContentEditable;

      if (isInputFocused) return;

      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        removeShape(selectedId);
        setSelectedId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const oldScale = scale;
    const pointer = stageRef.current.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setPosition(newPos);
  };

  const snapToGrid = (value, spacing) => Math.round(value / spacing) * spacing;

  const handleMouseDown = (e) => {
    const pointer = stageRef.current.getPointerPosition();
    lastPointerPos.current = pointer;
    mouseDownPos.current = pointer;

    const target = e.target;
    const isValidTarget =
      target === stageRef.current ||
      target.name() === "background" ||
      target.name() === "grid";

    if (isValidTarget) {
      isPanning.current = true;
      stageRef.current.container().style.cursor = "grabbing";
    }
  };

  const handleMouseMove = (e) => {
    if (!isPanning.current || !lastPointerPos.current) return;

    const pointer = stageRef.current.getPointerPosition();
    const dx = pointer.x - lastPointerPos.current.x;
    const dy = pointer.y - lastPointerPos.current.y;

    setPosition((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    lastPointerPos.current = pointer;
  };

  const handleMouseUp = (e) => {
    isPanning.current = false;
    stageRef.current.container().style.cursor = "default";

    const pointer = stageRef.current.getPointerPosition();
    const down = mouseDownPos.current;
    if (!pointer || !down) return;

    const dx = Math.abs(pointer.x - down.x);
    const dy = Math.abs(pointer.y - down.y);
    const isClick = dx < 5 && dy < 5;

    const target = e.target;
    const className = target.getClassName();
    const isEmptyClick =
      target === stageRef.current ||
      target.name() === "background" ||
      target.name() === "grid";
    const isTransformerClick =
      className === "Transformer" ||
      target.getParent()?.getClassName() === "Transformer";

    if (!isClick) return;

    if (isEmptyClick) {
      if (selectedId) {
        setSelectedId(null);
        wasDeselected.current = true;
        wasEmptyClick.current = false;
        return;
      }

      if (!selectedId && activeTool) {
        // сбрасываем флаги
        wasDeselected.current = false;
        wasEmptyClick.current = false;

        if (!activeTool) return;

        let x = (pointer.x - position.x) / scale;
        let y = (pointer.y - position.y) / scale;

        if (showGrid) {
          x = snapToGrid(x, gridSpacing);
          y = snapToGrid(y, gridSpacing);
        }

        if (activeTool === "rectangle") {
          console.log("Adding shape", activeTool, x, y);

          addShape({
            id: crypto.randomUUID(),
            type: "rectangle",
            x,
            y,
            width: 100,
            height: 60,
            fill: "#4f46e5",
          });
        }

        if (activeTool === "circle") {
          addShape({
            id: crypto.randomUUID(),
            type: "circle",
            x,
            y,
            radiusX: 40,
            radiusY: 40,
            fill: "#e11d48",
          });
        }

        if (activeTool === "triangle") {
          const rawPoints = [
            { x: x, y: y - 200 },
            { x: x - 200, y: y + 200 },
            { x: x + 200, y: y + 200 },
          ];

          const minX = Math.min(...rawPoints.map((p) => p.x));
          const minY = Math.min(...rawPoints.map((p) => p.y));

          const relativePoints = rawPoints.map((p) => ({
            x: p.x - minX,
            y: p.y - minY,
          }));

          addShape({
            id: crypto.randomUUID(),
            type: "triangle",
            x: minX,
            y: minY,
            points: relativePoints,
            cornerRadii: [0, 0, 0], // ← теперь уголки есть
            fill: "#14b8a6",
          });
        }
      }
    } else if (!isTransformerClick) {
      if (
        className === "Rect" ||
        className === "Circle" ||
        className === "Line"
      ) {
        setSelectedId(target.id());
      } else {
        setSelectedId(null);
      }
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={(e) => {
          e.evt.preventDefault();
          const scaleBy = 1.05;
          const oldScale = scale;
          const pointer = stageRef.current.getPointerPosition();

          const mousePointTo = {
            x: (pointer.x - position.x) / oldScale,
            y: (pointer.y - position.y) / oldScale,
          };

          const newScale =
            e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
          const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
          };

          setScale(newScale);
          setPosition(newPos);
        }}

  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}

        ref={stageRef}
        className="bg-neutral-200"
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={Math.max(1, width)}
            height={Math.max(1, height)}
            fill={bgColor === "transparent" ? "rgba(255,255,255,0.001)" : bgColor}
            stroke={"#777"}
            strokeWidth={showGrid ? 0.3 : 0}
            name="background"
            perfectDrawEnabled={false}
          />
        </Layer>

        <Layer>
          <Guidelines />
          {shapes
            .slice()
            .reverse()
            .map((shape) => {
              if (shape.type === "rectangle") {
                return <RectangleShape key={shape.id} shape={shape} />;
              }
              if (shape.type === "triangle") {
                return <TriangleShape key={shape.id} shape={shape} />;
              }
              if (shape.type === "circle") {
                return <CircleShape key={shape.id} shape={shape} />;
              }
              return null;
            })}
          <Transformer
            ref={transformerRef}
            centeredScaling={true}
            rotationEnabled={true}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) return oldBox;
              return newBox;
            }}
          />
        </Layer>

        <Layer>
          {showGrid && (
            <Grid
              spacing={gridSpacing}
              canvasWidth={width}
              canvasHeight={height}
              name="grid"
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}