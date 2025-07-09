import React, { useRef } from "react";
import { Ellipse } from "react-konva";
import { useCanvasStore } from "../../store/canvasStore";

export default function CircleShape({ shape }) {
  const {
    selectedId,
    updateShape,
    showGrid,
    gridSpacing,
    setSelectedId,
    shapes,
    setGuidelines,
    clearGuidelines,
    snapEnabled,
  } = useCanvasStore();

  const snapToGrid = (value, spacing) => Math.round(value / spacing) * spacing;
  const snappedToGuideline = useRef(false);
  const LINE_OFFSET = 5;

  const handleDragMove = (e) => {
    if (!snapEnabled) {
      return;
    }

    const node = e.target;
    snappedToGuideline.current = false;

    const radiusX = shape.radiusX;
    const radiusY = shape.radiusY;

    // Текущий "бокс" фигуры с учетом offset (центр эллипса)
    let box = {
      x: node.x() - radiusX,
      y: node.y() - radiusY,
      width: radiusX * 2,
      height: radiusY * 2,
    };

    const getMovingEdges = (box) => ({
      left: box.x,
      right: box.x + box.width,
      top: box.y,
      bottom: box.y + box.height,
      centerX: box.x + box.width / 2,
      centerY: box.y + box.height / 2,
    });

    const edgePairs = [
      ["top", "top"],
      ["top", "bottom"],
      ["bottom", "top"],
      ["bottom", "bottom"],
      ["centerY", "top"],
      ["centerY", "bottom"],
      ["top", "centerY"],
      ["bottom", "centerY"],
      ["left", "left"],
      ["left", "right"],
      ["right", "left"],
      ["right", "right"],
      ["centerX", "left"],
      ["centerX", "right"],
      ["left", "centerX"],
      ["right", "centerX"],
    ];

    const lines = [];

    for (const other of shapes) {
      if (other.id === shape.id) continue;

      // Поддержка для других типов фигур — определяем "бокс" для привязок
      const otherBox = {
        x: other.x - (other.radiusX ?? other.width / 2 ?? 0),
        y: other.y - (other.radiusY ?? other.height / 2 ?? 0),
        width: other.width ?? (other.radiusX ?? 0) * 2,
        height: other.height ?? (other.radiusY ?? 0) * 2,
      };

      const otherEdges = {
        left: otherBox.x,
        right: otherBox.x + otherBox.width,
        top: otherBox.y,
        bottom: otherBox.y + otherBox.height,
        centerX: otherBox.x + otherBox.width / 2,
        centerY: otherBox.y + otherBox.height / 2,
      };

      const movingEdges = getMovingEdges(box);

      edgePairs.forEach(([movingKey, staticKey]) => {
        const movingValue = movingEdges[movingKey];
        const staticValue = otherEdges[staticKey];

        if (Math.abs(movingValue - staticValue) < LINE_OFFSET) {
          snappedToGuideline.current = true;

          if (["left", "right", "centerX"].includes(movingKey)) {
            const dx = staticValue - (movingEdges[movingKey] - box.x);
            node.x(dx + radiusX);
          }

          if (["top", "bottom", "centerY"].includes(movingKey)) {
            const dy = staticValue - (movingEdges[movingKey] - box.y);
            node.y(dy + radiusY);
          }

          // Обновляем box после сдвига
          box.x = node.x() - radiusX;
          box.y = node.y() - radiusY;

          // Добавляем линии привязок
          if (["left", "right", "centerX"].includes(movingKey)) {
            lines.push({
              points: [staticValue, 0, staticValue, 2000],
              orientation: "v",
            });
          }
          if (["top", "bottom", "centerY"].includes(movingKey)) {
            lines.push({
              points: [0, staticValue, 2000, staticValue],
              orientation: "h",
            });
          }
        }
      });
    }

    setGuidelines(lines);
  };

  return (
    <Ellipse
      id={shape.id}
      x={shape.x}
      y={shape.y}
      radiusX={shape.radiusX}
      radiusY={shape.radiusY}
      offsetX={shape.radiusX}
      offsetY={shape.radiusY}
      fill={shape.fill}
      opacity={shape.opacity ?? 1}
      rotation={shape.rotation || 0}
      draggable={selectedId === shape.id}
      onClick={() => setSelectedId(shape.id)}
      onTap={() => setSelectedId(shape.id)}
      onDragMove={handleDragMove}
      onDragEnd={(e) => {
        let x = e.target.x();
        let y = e.target.y();

        if (showGrid && !snappedToGuideline.current) {
          x = snapToGrid(x, gridSpacing);
          y = snapToGrid(y, gridSpacing);
          e.target.position({ x, y });
        }

        updateShape(shape.id, { x, y });
        clearGuidelines();
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);

        let radiusX = node.radiusX() * scaleX;
        let radiusY = node.radiusY() * scaleY;

        if (showGrid) {
          radiusX = snapToGrid(radiusX, gridSpacing);
          radiusY = snapToGrid(radiusY, gridSpacing);
        }

        updateShape(shape.id, {
          x: node.x(),
          y: node.y(),
          radiusX: Math.max(5, radiusX),
          radiusY: Math.max(5, radiusY),
          rotation: node.rotation(),
        });
      }}
    />
  );
}
