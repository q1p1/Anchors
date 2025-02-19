import { AnchorProps } from "../../types";

const Anchor = ({
  anchor,
  scale,
  onDragStart,
  onDrag,
  onDragEnd,
  isDragging,
  onDelete,
  workers = 10,
}: AnchorProps & { workers?: number }) => {
  // Calculate number of points needed (1 point per 10 workers)
  const numberOfPoints = Math.floor(workers / 10);

  // Generate density points
  const generateDensityPoints = () => {
    const points = [];
    const radius = (anchor.diameter * scale) / 4; // Points will be at 25% of the radius

    for (let i = 0; i < numberOfPoints; i++) {
      // Calculate position
      const angle = (i / numberOfPoints) * 2 * Math.PI;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      points.push(
        <div
          key={i}
          className="absolute w-4 h-4 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-sm"
          style={{
            left: `${x}px`,
            top: `${y}px`,
          }}
        />
      );
    }
    return points;
  };

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move
        ${isDragging ? "z-50 shadow-lg" : "z-10"}`}
      style={{
        left: `${anchor.x * scale}px`,
        top: `${anchor.y * scale}px`,
      }}
      onMouseDown={(e) => onDragStart?.(e, anchor.id)}
      onMouseMove={(e) => onDrag?.(e)}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
      onDoubleClick={() => onDelete?.(anchor.id)}
    >
      <div
        className={`absolute rounded-full border-[6px] ${
          anchor.isDensityAnchor ? "border-purple-600" : "border-blue-600"
        }`}
        style={{
          width: `${20 * scale}px`,
          height: `${20 * scale}px`,
          transform: "translate(-50%, -50%)",
          borderStyle: "solid",
          opacity: "0.7",
        }}
      >
        {/* Density points */}
        {generateDensityPoints()}
      </div>

      <div className="relative z-20">
        <div
          className={`w-6 h-6 ${
            anchor.isDensityAnchor ? "bg-purple-600" : "bg-blue-600"
          } rounded-full shadow-lg flex items-center justify-center`}
        >
          <div className="w-2.5 h-2.5 bg-white rounded-full" />

          {/* Worker count label */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1 rounded-full whitespace-nowrap">
            {workers} workers
          </div>
        </div>
      </div>
    </div>
  );
};

export default Anchor;
