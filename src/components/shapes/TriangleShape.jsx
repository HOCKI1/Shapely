import React, { useRef } from "react";
import { Circle, Shape } from "react-konva";
import { useCanvasStore } from "../../store/canvasStore";

export default function TriangleShape({ shape }) {
  const {
    selectedId,
    updateShape,
    setSelectedId,
    showGrid,
    gridSpacing,
    shapes,
    setGuidelines,
    clearGuidelines,
  } = useCanvasStore();

  const snapDistance = 7; // пиксели для "прилипания"
  const snapToGrid = (value, spacing) => Math.round(value / spacing) * spacing;
  const LINE_LENGTH = 2000;

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

  const { points, cornerRadii = [0, 0, 0] } = shape;
  const [p0, p1, p2] = points;
  const [r0, r1, r2] = cornerRadii;

  // функция для сброса линий привязки
  const clearSnapLines = () => setGuidelines([]);

  // Сопоставление точек для привязки из других фигур
  // Собираем все точки для привязки: для треугольников - их вершины + центр
  const getAllSnapPoints = () => {
    const allPoints = [];
    for (const s of shapes) {
      if (s.id === shape.id) continue;
      if (!s.points) continue;
      s.points.forEach((pt) => {
        allPoints.push({ x: s.x + pt.x, y: s.y + pt.y });
      });
      // центр фигуры для snap тоже добавляем
      const cx = s.x + s.points.reduce((acc, p) => acc + p.x, 0) / s.points.length;
      const cy = s.y + s.points.reduce((acc, p) => acc + p.y, 0) / s.points.length;
      allPoints.push({ x: cx, y: cy });
    }
    return allPoints;
  };

  // Привязка координаты с snap и линии для визуализации
  const trySnap = (value, otherPoints, axis) => {
    for (const pt of otherPoints) {
      const coord = axis === "x" ? pt.x : pt.y;
      if (Math.abs(value - coord) < snapDistance) {
        return { snappedValue: coord, snapLine: axis === "x"
          ? [coord, 0, coord, LINE_LENGTH]
          : [0, coord, LINE_LENGTH, coord] };
      }
    }
    return { snappedValue: value, snapLine: null };
  };

  return (
    <>
      <Shape
        id={shape.id}
        x={shape.x}
        y={shape.y}
        draggable={selectedId === shape.id}
        rotation={0}
        sceneFunc={(ctx, shapeObj) => {
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

          ctx.fillStrokeShape(shapeObj);
        }}
        fill={shape.fill}
        stroke={selectedId === shape.id ? "#208de4" : undefined}
        strokeWidth={selectedId === shape.id ? 2 : 0}
        onClick={() => setSelectedId(shape.id)}
        onTap={() => setSelectedId(shape.id)}
        onDragEnd={(e) => {
          let newX = e.target.x();
          let newY = e.target.y();
          if (showGrid) {
            newX = snapToGrid(newX, gridSpacing);
            newY = snapToGrid(newY, gridSpacing);
            e.target.position({ x: newX, y: newY });
          }
          updateShape(shape.id, { x: newX, y: newY });
          clearSnapLines();
        }}
      />

      {selectedId === shape.id &&
        points.map((point, index) => {
          const otherPoints = getAllSnapPoints();

          return (
            <Circle
              key={index}
              x={shape.x + point.x}
              y={shape.y + point.y}
              radius={6}
              fill="#f5f5f5"
              stroke="#208de4"
              strokeWidth={2}
              draggable
              onDragMove={(e) => {
                clearSnapLines();

                let newX = e.target.x();
                let newY = e.target.y();

                // Привязка к сетке
                if (showGrid) {
                  newX = snapToGrid(newX, gridSpacing);
                  newY = snapToGrid(newY, gridSpacing);
                }

                // Snap к другим точкам
                const snapX = trySnap(newX, otherPoints, "x");
                const snapY = trySnap(newY, otherPoints, "y");

                if (snapX.snapLine) setGuidelines((lines) => [...lines, { points: snapX.snapLine, orientation: "v" }]);
                if (snapY.snapLine) setGuidelines((lines) => [...lines, { points: snapY.snapLine, orientation: "h" }]);

                newX = snapX.snappedValue;
                newY = snapY.snappedValue;

                const updatedPoints = [...points];
                updatedPoints[index] = { x: newX - shape.x, y: newY - shape.y };

                updateShape(shape.id, { points: updatedPoints });

                e.target.position({ x: newX, y: newY });
              }}
              onDragEnd={(e) => {
                clearSnapLines();

                let newX = e.target.x();
                let newY = e.target.y();

                if (showGrid) {
                  newX = snapToGrid(newX, gridSpacing);
                  newY = snapToGrid(newY, gridSpacing);
                }

                const updatedPoints = [...points];
                updatedPoints[index] = { x: newX - shape.x, y: newY - shape.y };
                updateShape(shape.id, { points: updatedPoints });

                e.target.position({ x: newX, y: newY });
              }}
            />
          );
        })}
    </>
  );
}
