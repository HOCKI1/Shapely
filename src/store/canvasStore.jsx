import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useCanvasStore = create(
  devtools((set) => ({
    // Размер и фон
    width: 1920,
    height: 1080,
    bgColor: "white",
    isCreated: false,
    showGrid: true,
    gridSpacing: 50,
    activeTool: null,
    shapes: [],
    selectedId: null,

    createNewFile: ({ width, height, bgColor }) =>
      set({
        width,
        height,
        bgColor:
          bgColor === "white"
            ? "#ffffff"
            : bgColor === "black"
            ? "#000000"
            : "transparent",
        shapes: [],
        selectedId: null,
        guidelines: [],
        isCreated: true,
      }),

    resetCanvas: () =>
      set({
        width: 1920,
        height: 1080,
        bgColor: "white",
        isCreated: false,
        shapes: [],
        selectedId: null,
        activeTool: null,
      }),

    toggleGrid: () =>
      set((state) => ({
        showGrid: !state.showGrid,
      })),

    setShowGrid: (value) => set({ showGrid: value }),

    setGridSpacing: (value) => set({ gridSpacing: value }),

    setActiveTool: (tool) => set({ activeTool: tool }),

    addShape: (shape) =>
      set((state) => {
        console.log("addShape called", shape);
        return { shapes: [...state.shapes, shape] };
      }),

    setSelectedId: (id) => set({ selectedId: id }),

    updateShape: (id, updates) =>
      set((state) => ({
        shapes: state.shapes.map((shape) =>
          shape.id === id ? { ...shape, ...updates } : shape
        ),
      })),

    removeShape: (id) =>
      set((state) => ({
        shapes: state.shapes.filter((shape) => shape.id !== id),
      })),

    guidelines: [],

    setGuidelines: (lines) =>
      set(() => ({
        guidelines: lines,
      })),

    clearGuidelines: () =>
      set(() => ({
        guidelines: [],
      })),

    snapEnabled: true,

    toggleSnapEnabled: () =>
      set((state) => ({ snapEnabled: !state.snapEnabled })),

    reorderShapes: (fromIndex, toIndex) => {
      set((state) => {
        const newShapes = [...state.shapes];
        const [moved] = newShapes.splice(fromIndex, 1);
        newShapes.splice(toIndex, 0, moved);
        return { shapes: newShapes };
      });
    },
  }))
);
