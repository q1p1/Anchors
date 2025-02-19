import { DensityZone, Anchor } from "../../types";
import { useState } from "react";
import DensityZonePopup from "./DensityZonePopup";

interface DensityZoneProps {
  zone: DensityZone;
  onResize: (id: string, changes: Partial<DensityZone>) => void;
  onDelete: (id: string) => void;
  onWorkersChange: (id: string, workers: number) => void;
  onNameChange: (id: string, name: string) => void;
  coverage: number;
  onMove?: (id: string, deltaX: number, deltaY: number) => void;
  densityAnchors: Anchor[];
  onAnchorMove: (anchorId: string, x: number, y: number) => void;
}

const DensityZoneComponent = ({
  zone,
  onResize,
  onDelete,
  coverage,
  onMove,
  densityAnchors,
  onAnchorMove,
}: DensityZoneProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({ x: e.clientX, y: e.clientY });
    setOriginalDimensions({
      x: zone.x,
      y: zone.y,
      width: zone.width,
      height: zone.height,
    });

    const handleResize = (e: MouseEvent) => {
      if (!isResizing || !resizeDirection) return;

      const deltaX = ((e.clientX - resizeStart.x) / window.innerWidth) * 100;
      const deltaY = ((e.clientY - resizeStart.y) / window.innerHeight) * 100;

      let newDimensions = { ...originalDimensions };

      switch (resizeDirection) {
        case "nw":
          newDimensions = {
            x: originalDimensions.x + deltaX,
            y: originalDimensions.y + deltaY,
            width: originalDimensions.width - deltaX,
            height: originalDimensions.height - deltaY,
          };
          break;
        case "ne":
          newDimensions = {
            ...newDimensions,
            y: originalDimensions.y + deltaY,
            width: originalDimensions.width + deltaX,
            height: originalDimensions.height - deltaY,
          };
          break;
        case "sw":
          newDimensions = {
            x: originalDimensions.x + deltaX,
            y: originalDimensions.y,
            width: originalDimensions.width - deltaX,
            height: originalDimensions.height + deltaY,
          };
          break;
        case "se":
          newDimensions = {
            ...newDimensions,
            width: originalDimensions.width + deltaX,
            height: originalDimensions.height + deltaY,
          };
          break;
      }

      // Ensure new dimensions are valid
      if (newDimensions.width >= 5 && newDimensions.height >= 5) {
        // Keep zone within image bounds
        newDimensions.x = Math.max(
          0,
          Math.min(100 - newDimensions.width, newDimensions.x)
        );
        newDimensions.y = Math.max(
          0,
          Math.min(100 - newDimensions.height, newDimensions.y)
        );
        onResize(zone.id, newDimensions);
      }
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
      setResizeDirection(null);
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", handleResizeEnd);
    };

    window.addEventListener("mousemove", handleResize);
    window.addEventListener("mouseup", handleResizeEnd);
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startZoneX = zone.x;
    const startZoneY = zone.y;

    const handleDrag = (e: MouseEvent) => {
      const deltaX = ((e.clientX - startX) / window.innerWidth) * 100;
      const deltaY = ((e.clientY - startY) / window.innerHeight) * 100;

      const newX = Math.max(0, Math.min(100 - zone.width, startZoneX + deltaX));
      const newY = Math.max(
        0,
        Math.min(100 - zone.height, startZoneY + deltaY)
      );

      onMove?.(zone.id, newX - zone.x, newY - zone.y);
    };

    const handleDragEnd = () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);
    };

    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mouseup", handleDragEnd);
  };

  const handleAnchorDrag = (anchorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const anchor = densityAnchors.find((a) => a.id === anchorId);
    if (!anchor) return;

    const handleDrag = (e: MouseEvent) => {
      const element = e.currentTarget as HTMLElement;
      const zoneRect = element.getBoundingClientRect();

      let newX =
        ((e.clientX - startX) / zoneRect.width) * zone.width + anchor.x;
      let newY =
        ((e.clientY - startY) / zoneRect.height) * zone.height + anchor.y;

      newX = Math.max(zone.x, Math.min(zone.x + zone.width, newX));
      newY = Math.max(zone.y, Math.min(zone.y + zone.height, newY));

      onAnchorMove(anchorId, newX, newY);
    };

    const handleDragEnd = () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);
    };

    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mouseup", handleDragEnd);
  };

  return (
    <div
      className="absolute group cursor-move"
      style={{
        left: `${zone.x}%`,
        top: `${zone.y}%`,
        width: `${zone.width}%`,
        height: `${zone.height}%`,
      }}
      onMouseDown={handleDragStart}
    >
      {/* Main zone */}
      <div className="absolute inset-0 bg-blue-100 opacity-20" />
      <div className="absolute inset-0 border-2 border-blue-500 border-dashed" />

      {/* Resize handles */}
      <div
        className="absolute -top-1 -left-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize"
        onMouseDown={(e) => handleResizeStart(e, "nw")}
      />
      <div
        className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize"
        onMouseDown={(e) => handleResizeStart(e, "ne")}
      />
      <div
        className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize"
        onMouseDown={(e) => handleResizeStart(e, "sw")}
      />
      <div
        className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-se-resize"
        onMouseDown={(e) => handleResizeStart(e, "se")}
      />

      {/* Density anchors */}
      {densityAnchors
        .filter(
          (anchor) =>
            anchor.x >= zone.x &&
            anchor.x <= zone.x + zone.width &&
            anchor.y >= zone.y &&
            anchor.y <= zone.y + zone.height &&
            anchor.id.includes(zone.id)
        )
        .map((anchor) => (
          <div
            key={anchor.id}
            className="absolute w-6 h-6 bg-purple-500 rounded-full cursor-move
              transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 
              transition-transform shadow-lg flex items-center justify-center
              border-2 border-white"
            style={{
              left: `${((anchor.x - zone.x) / zone.width) * 100}%`,
              top: `${((anchor.y - zone.y) / zone.height) * 100}%`,
            }}
            onMouseDown={(e) => handleAnchorDrag(anchor.id, e)}
            title="10 workers"
          >
            <span className="text-white text-xs font-bold">10</span>
          </div>
        ))}

      {/* Info and controls */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white bg-opacity-90 px-3 py-2 rounded shadow-sm">
          <div className="text-sm font-medium text-blue-600">
            {zone.workers} workers · {coverage.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowPopup(true);
          }}
          className="m-1 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
          title="Edit"
        >
          ✎
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(zone.id);
          }}
          className="m-1 p-1.5 bg-red-500 text-white rounded hover:bg-red-600"
          title="Delete"
        >
          ×
        </button>
      </div>

      {showPopup && (
        <DensityZonePopup
          zone={zone}
          onClose={() => setShowPopup(false)}
          onUpdate={(id, changes) => {
            onResize(id, changes);
            setShowPopup(false);
          }}
          coverage={coverage}
        />
      )}
    </div>
  );
};

export default DensityZoneComponent;
