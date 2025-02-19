import { ExclusionZone } from "../../types";

interface ExclusionZoneProps {
  zone: ExclusionZone;
  onResize: (id: string, changes: Partial<ExclusionZone>) => void;
  onDelete: (id: string) => void;
}

const ExclusionZoneComponent = ({
  zone,
  onResize,
  onDelete,
}: ExclusionZoneProps) => {
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startZoneX = zone.x;
    const startZoneY = zone.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = ((moveEvent.clientX - startX) / window.innerWidth) * 100;
      const dy = ((moveEvent.clientY - startY) / window.innerHeight) * 100;

      onResize(zone.id, {
        x: Math.max(0, Math.min(100 - zone.width, startZoneX + dx)),
        y: Math.max(0, Math.min(100 - zone.height, startZoneY + dy)),
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleResize = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = zone.width;
    const startHeight = zone.height;
    const startZoneX = zone.x;
    const startZoneY = zone.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = ((moveEvent.clientX - startX) / window.innerWidth) * 100;
      const dy = ((moveEvent.clientY - startY) / window.innerHeight) * 100;

      switch (direction) {
        case "right":
          onResize(zone.id, {
            width: Math.max(5, Math.min(100 - zone.x, startWidth + dx)),
          });
          break;
        case "bottom":
          onResize(zone.id, {
            height: Math.max(5, Math.min(100 - zone.y, startHeight + dy)),
          });
          break;
        case "left": {
          const newLeftWidth = Math.max(5, startWidth - dx);
          const newLeftX = Math.max(
            0,
            Math.min(startZoneX + dx, startZoneX + startWidth - 5)
          );
          onResize(zone.id, { x: newLeftX, width: newLeftWidth });
          break;
        }
        case "top": {
          const newTopHeight = Math.max(5, startHeight - dy);
          const newTopY = Math.max(
            0,
            Math.min(startZoneY + dy, startZoneY + startHeight - 5)
          );
          onResize(zone.id, { y: newTopY, height: newTopHeight });
          break;
        }
        case "topRight": {
          onResize(zone.id, {
            y: Math.max(0, startZoneY + dy),
            height: Math.max(5, startHeight - dy),
            width: Math.max(5, Math.min(100 - zone.x, startWidth + dx)),
          });
          break;
        }
        case "bottomLeft": {
          onResize(zone.id, {
            x: Math.max(0, startZoneX + dx),
            width: Math.max(5, startWidth - dx),
            height: Math.max(5, Math.min(100 - zone.y, startHeight + dy)),
          });
          break;
        }
        case "bottomRight":
          onResize(zone.id, {
            width: Math.max(5, Math.min(100 - zone.x, startWidth + dx)),
            height: Math.max(5, Math.min(100 - zone.y, startHeight + dy)),
          });
          break;
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className="absolute group"
      style={{
        left: `${zone.x}%`,
        top: `${zone.y}%`,
        width: `${zone.width}%`,
        height: `${zone.height}%`,
      }}
      onMouseDown={handleDragStart}
    >
      {/* Exclusion zone with borders */}
      <div className="absolute inset-0 bg-red-100 opacity-20" />
      <div className="absolute inset-0 border-4 border-red-500 border-dashed opacity-60" />

      {/* Hover border */}
      <div className="absolute inset-0 border-2 border-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Corner control points */}
      <div
        className="absolute top-0 left-0 w-4 h-4 bg-red-500 cursor-nw-resize -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 rounded-full shadow-md hover:scale-110 transition-all"
        onMouseDown={(e) => handleResize(e, "topLeft")}
      />
      <div
        className="absolute top-0 right-0 w-4 h-4 bg-red-500 cursor-ne-resize translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 rounded-full shadow-md hover:scale-110 transition-all"
        onMouseDown={(e) => handleResize(e, "topRight")}
      />
      <div
        className="absolute bottom-0 left-0 w-4 h-4 bg-red-500 cursor-sw-resize -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 rounded-full shadow-md hover:scale-110 transition-all"
        onMouseDown={(e) => handleResize(e, "bottomLeft")}
      />
      <div
        className="absolute bottom-0 right-0 w-4 h-4 bg-red-500 cursor-se-resize translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 rounded-full shadow-md hover:scale-110 transition-all"
        onMouseDown={(e) => handleResize(e, "bottomRight")}
      />

      {/* Edge control points */}
      <div
        className="absolute top-1/2 left-0 w-4 h-4 bg-red-500 cursor-ew-resize -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 rounded-full shadow-md hover:scale-110 transition-all"
        onMouseDown={(e) => handleResize(e, "left")}
      />
      <div
        className="absolute top-1/2 right-0 w-4 h-4 bg-red-500 cursor-ew-resize translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 rounded-full shadow-md hover:scale-110 transition-all"
        onMouseDown={(e) => handleResize(e, "right")}
      />
      <div
        className="absolute top-0 left-1/2 w-4 h-4 bg-red-500 cursor-ns-resize -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 rounded-full shadow-md hover:scale-110 transition-all"
        onMouseDown={(e) => handleResize(e, "top")}
      />
      <div
        className="absolute bottom-0 left-1/2 w-4 h-4 bg-red-500 cursor-ns-resize -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 rounded-full shadow-md hover:scale-110 transition-all"
        onMouseDown={(e) => handleResize(e, "bottom")}
      />

      {/* Delete button */}
      <button
        className="absolute -top-8 right-0 bg-red-500 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(zone.id);
        }}
      >
        Delete Zone
      </button>

      {/* Zone label */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 font-bold text-lg opacity-50">
        Exclusion Zone
      </div>
    </div>
  );
};

export default ExclusionZoneComponent;
