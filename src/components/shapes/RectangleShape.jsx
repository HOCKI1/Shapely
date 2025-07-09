import React, { useRef } from "react";
import { Rect } from "react-konva";
import { useCanvasStore } from "../../store/canvasStore";

export default function RectangleShape({ shape }) {
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
  const isRotated = (shape.rotation || 0) % 360 !== 0;
  const LINE_OFFSET = 5;

  const snappedToGuideline = useRef(false);

  const handleDragMove = (e) => {
    if (!snapEnabled) {
      return;
    }
    const node = e.target;
    snappedToGuideline.current = false;

    const movingBox = {
      x: node.x(),
      y: node.y(),
      width: shape.width,
      height: shape.height,
    };

    const getMovingEdges = () => ({
      left: node.x(),
      right: node.x() + movingBox.width,
      top: node.y(),
      bottom: node.y() + movingBox.height,
      centerX: node.x() + movingBox.width / 2,
      centerY: node.y() + movingBox.height / 2,
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

      const otherBox = {
        x: other.x,
        y: other.y,
        width: other.width ?? other.radiusX * 2 ?? 0,
        height: other.height ?? other.radiusY * 2 ?? 0,
      };

      const otherEdges = {
        left: otherBox.x,
        right: otherBox.x + otherBox.width,
        top: otherBox.y,
        bottom: otherBox.y + otherBox.height,
        centerX: otherBox.x + otherBox.width / 2,
        centerY: otherBox.y + otherBox.height / 2,
      };

      edgePairs.forEach(([movingKey, staticKey]) => {
        const movingEdges = getMovingEdges();
        const movingValue = movingEdges[movingKey];
        const staticValue = otherEdges[staticKey];

        if (Math.abs(movingValue - staticValue) < LINE_OFFSET) {
          snappedToGuideline.current = true;

          if (["left", "right", "centerX"].includes(movingKey)) {
            const dx = staticValue - (movingEdges[movingKey] - node.x());
            node.x(dx);
            lines.push({
              points: [staticValue, 0, staticValue, 2000],
              orientation: "v",
            });
          }

          if (["top", "bottom", "centerY"].includes(movingKey)) {
            const dy = staticValue - (movingEdges[movingKey] - node.y());
            node.y(dy);
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
    <Rect
      id={shape.id}
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      fill={shape.fill}
      opacity={shape.opacity ?? 1}
      offsetX={shape.width / 2}
      offsetY={shape.height / 2}
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

          x = Math.round(x);
          y = Math.round(y);

          e.target.position({ x, y });
        }

        x = Math.round(x);
        y = Math.round(y);

        updateShape(shape.id, { x, y });
        clearGuidelines();
      }}
      sceneFunc={(ctx, shapeObj) => {
        const {
          width,
          height,
          cornerRadiusTopLeft = 0,
          cornerRadiusTopRight = 0,
          cornerRadiusBottomRight = 0,
          cornerRadiusBottomLeft = 0,
        } = shape;

        ctx.beginPath();
        ctx.moveTo(cornerRadiusTopLeft, 0);
        ctx.lineTo(width - cornerRadiusTopRight, 0);
        ctx.quadraticCurveTo(width, 0, width, cornerRadiusTopRight);
        ctx.lineTo(width, height - cornerRadiusBottomRight);
        ctx.quadraticCurveTo(
          width,
          height,
          width - cornerRadiusBottomRight,
          height
        );
        ctx.lineTo(cornerRadiusBottomLeft, height);
        ctx.quadraticCurveTo(0, height, 0, height - cornerRadiusBottomLeft);
        ctx.lineTo(0, cornerRadiusTopLeft);
        ctx.quadraticCurveTo(0, 0, cornerRadiusTopLeft, 0);
        ctx.closePath();

        ctx.fillStrokeShape(shapeObj);
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);

        let width = Math.max(5, node.width() * scaleX);
        let height = Math.max(5, node.height() * scaleY);

        if (showGrid) {
          width = snapToGrid(width, gridSpacing);
          height = snapToGrid(height, gridSpacing);
        }

        updateShape(shape.id, {
          x: node.x(),
          y: node.y(),
          width,
          height,
          rotation: node.rotation(),
        });
      }}
    />
  );
}
