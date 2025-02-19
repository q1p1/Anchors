import React, { useState, useRef } from "react";
import SelectionZone from "./SelectionZone";
import { Anchor } from "../../types";
import ZoneNameDialog from "./ZoneNameDialog";
import wakecapLogo from "../../assets/WakeCap+Logo+Only+for+Black+BG.png";
const ANCHOR_DIAMETER = 0.05; // meters

const FileViewer = () => {
  const [projectArea, setProjectArea] = useState<number>(0);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [isProjectSetup, setIsProjectSetup] = useState<boolean>(false);
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawingZone, setIsDrawingZone] = useState<boolean>(false);
  const [distributionZones, setDistributionZones] = useState<
    {
      id: string;
      name: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }[]
  >([]);
  const [showZones, setShowZones] = useState<boolean>(true);
  const [additionalAnchors, setAdditionalAnchors] = useState<number>(0);
  const [pendingZone, setPendingZone] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<"none" | "drawing" | "manual">(
    "none"
  );
  const [draggedAnchor, setDraggedAnchor] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    }
  };

  const handleStartDrawingZone = () => {
    setCurrentMode("drawing");
    setIsDrawingZone(true);
    setIsManualMode(false);
    setAnchors([]);
  };

  const handleToggleManualMode = () => {
    const newMode = currentMode === "manual" ? "none" : "manual";
    setCurrentMode(newMode);
    setIsManualMode(newMode === "manual");
    setIsDrawingZone(false);
  };

  const handleZoneSelection = (zone: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    setPendingZone(zone);
    setCurrentMode("none");
    setIsDrawingZone(false);
  };

  const handleZoneNameConfirm = (name: string) => {
    if (pendingZone) {
      setDistributionZones((prev) => [
        ...prev,
        {
          id: `zone-${prev.length}`,
          name,
          ...pendingZone,
        },
      ]);
      setPendingZone(null);
    }
  };

  const handleDistribute = () => {
    distributeAnchors();
  };

  const distributeAnchors = () => {
    if (!imageRef.current || distributionZones.length === 0) return;

    const img = imageRef.current;
    const container = img.parentElement;
    if (!container) return;

    // Get actual image and container dimensions
    const imageWidth = img.naturalWidth;
    const imageHeight = img.naturalHeight;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate aspect ratios and display dimensions
    const imageRatio = imageWidth / imageHeight;
    const containerRatio = containerWidth / containerHeight;

    // Calculate display dimensions
    let displayWidth: number;
    let displayHeight: number;

    if (imageRatio > containerRatio) {
      displayWidth = containerWidth;
      displayHeight = containerWidth / imageRatio;
    } else {
      displayHeight = containerHeight;
      displayWidth = containerHeight * imageRatio;
    }

    // Calculate scale and minimum distance
    const metersPerPixel = Math.sqrt(projectArea / (imageWidth * imageHeight));
    const minDistancePixels = ANCHOR_DIAMETER / metersPerPixel;
    const newAnchors: Anchor[] = [];

    // Calculate total area of all zones
    const totalZoneArea = distributionZones.reduce((sum, zone) => {
      return sum + zone.width * zone.height;
    }, 0);

    // Calculate anchors per zone based on area proportion
    distributionZones.forEach((zone) => {
      const zoneArea = zone.width * zone.height;
      const zoneAnchors = Math.ceil(
        (zoneArea / totalZoneArea) * (projectArea / 75 + additionalAnchors)
      );

      // Calculate optimal grid spacing for this zone
      const zoneWidth = (zone.width / 100) * displayWidth;
      const zoneHeight = (zone.height / 100) * displayHeight;

      const aspectRatio = zoneWidth / zoneHeight;
      const rows = Math.floor(Math.sqrt(zoneAnchors / aspectRatio));
      const cols = Math.ceil(zoneAnchors / rows);

      const spacingX = zoneWidth / (cols + 1);
      const spacingY = zoneHeight / (rows + 1);

      // Create hexagonal grid pattern
      for (let row = 1; row <= rows; row++) {
        const isEvenRow = row % 2 === 0;
        const colOffset = isEvenRow ? spacingX / 2 : 0;
        const colsInRow = isEvenRow ? cols - 1 : cols;

        for (let col = 1; col <= colsInRow; col++) {
          const x =
            zone.x + ((colOffset + col * spacingX) / displayWidth) * 100;
          const y = zone.y + ((row * spacingY) / displayHeight) * 100;

          // Add some controlled randomness to avoid perfect grid
          const jitterX =
            (Math.random() - 0.5) * (spacingX / displayWidth) * 20;
          const jitterY =
            (Math.random() - 0.5) * (spacingY / displayHeight) * 20;

          // Ensure point stays within zone bounds
          const finalX = Math.max(
            zone.x,
            Math.min(zone.x + zone.width, x + jitterX)
          );
          const finalY = Math.max(
            zone.y,
            Math.min(zone.y + zone.height, y + jitterY)
          );

          // Check minimum distance from other anchors
          const isFarEnough = newAnchors.every((anchor) => {
            const dx = ((anchor.x - finalX) * displayWidth) / 100;
            const dy = ((anchor.y - finalY) * displayHeight) / 100;
            return Math.sqrt(dx * dx + dy * dy) >= minDistancePixels;
          });

          if (isFarEnough) {
            newAnchors.push({
              id: `anchor-${newAnchors.length}`,
              x: finalX,
              y: finalY,
              diameter: ANCHOR_DIAMETER,
              isManual: false,
            });
          }
        }
      }
    });
    // Keep manual anchors
    const manualAnchors = anchors.filter(
      (anchor) => "isManual" in anchor && anchor.isManual
    );

    // Add new anchors
    setAnchors([...manualAnchors, ...newAnchors]);
    setShowZones(false);
  };

  const handleAddAnchors = () => {
    setAdditionalAnchors((prev) => prev + 5);
    distributeAnchors();
  };

  const handleReduceAnchors = () => {
    setAdditionalAnchors((prev) => Math.max(0, prev - 5));
    distributeAnchors();
  };

  const handleManualAnchorAdd = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isManualMode || !imageRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const containerRect = e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    const y = ((e.clientY - containerRect.top) / containerRect.height) * 100;

    const isInsideZone = distributionZones.some((zone) => {
      return (
        x >= zone.x &&
        x <= zone.x + zone.width &&
        y >= zone.y &&
        y <= zone.y + zone.height
      );
    });

    if (isInsideZone) {
      setAnchors((prev) => [
        ...prev,
        {
          id: `manual-anchor-${Date.now()}`,
          x,
          y,
          diameter: ANCHOR_DIAMETER,
          isManual: true,
        },
      ]);
    }
  };

  const handleDeleteZone = (zoneId: string) => {
    setDistributionZones((prev) => prev.filter((zone) => zone.id !== zoneId));
    distributeAnchors();
  };

  const handleAnchorDragStart = (anchorId: string) => {
    setDraggedAnchor(anchorId);
  };

  const handleAnchorDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggedAnchor || !imageRef.current) return;

    const containerRect =
      imageRef.current.parentElement?.getBoundingClientRect();
    if (!containerRect) return;

    const x = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    const y = ((e.clientY - containerRect.top) / containerRect.height) * 100;

    const isInsideZone = distributionZones.some((zone) => {
      return (
        x >= zone.x &&
        x <= zone.x + zone.width &&
        y >= zone.y &&
        y <= zone.y + zone.height
      );
    });

    if (isInsideZone) {
      setAnchors((prev) =>
        prev.map((anchor) =>
          anchor.id === draggedAnchor ? { ...anchor, x, y } : anchor
        )
      );
    }
  };

  const handleAnchorDragEnd = () => {
    setDraggedAnchor(null);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <img
          src={wakecapLogo}
          alt="WakeCap Logo"
          className="h-12 object-contain"
        />
        <h1 className="text-2xl font-bold text-gray-800">
          Anchor Distribution Tool
        </h1>
      </div>

      {!isProjectSetup || !fileUrl ? (
        // Project Setup and File Upload Combined Phase
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Project Setup
          </h2>
          <div className="space-y-6">
            {/* Project Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter project name"
                required
              />
            </div>

            {/* Project Area Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Area (m²)
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  min="1"
                  value={projectArea || ""}
                  onChange={(e) => setProjectArea(Number(e.target.value))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter project area"
                />
                <span className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                  m²
                </span>
              </div>
            </div>

            {/* Blueprint Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Project Blueprint
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-500 transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4-4m4-4h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {/* Preview and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {projectName && (
                  <div className="text-sm text-gray-600">
                    Project: {projectName}
                  </div>
                )}
                {projectArea > 0 && (
                  <div className="text-sm text-gray-600">
                    • Area: {projectArea} m²
                  </div>
                )}
                {fileUrl && (
                  <div className="text-sm text-gray-600">
                    • Blueprint uploaded
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsProjectSetup(true)}
                disabled={!projectName || !projectArea || !fileUrl}
                className={`px-4 py-2 rounded-md text-white transition-colors
                  ${
                    projectName && projectArea && fileUrl
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Image Display and Distribution Phase
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {projectName}
                </h2>
                <p className="text-sm text-gray-600">Area: {projectArea} m²</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartDrawingZone}
                    disabled={currentMode === "manual"}
                    className={`px-4 py-2 text-white rounded-md transition-colors flex items-center gap-2
                      ${
                        currentMode === "drawing"
                          ? "bg-green-600 hover:bg-green-700"
                          : currentMode === "manual"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    {currentMode === "drawing" ? "Drawing Zone..." : "Add Zone"}
                  </button>

                  <button
                    onClick={handleToggleManualMode}
                    disabled={currentMode === "drawing"}
                    className={`px-4 py-2 text-white rounded-md transition-colors flex items-center gap-2
                      ${
                        currentMode === "manual"
                          ? "bg-purple-600 hover:bg-purple-700"
                          : currentMode === "drawing"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gray-500 hover:bg-gray-600"
                      }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    {currentMode === "manual"
                      ? "Exit Manual Mode"
                      : "Add Manual Anchors"}
                  </button>
                </div>

                <div className="h-8 w-px bg-gray-300"></div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDistribute}
                    disabled={distributionZones.length === 0}
                    className={`px-4 py-2 text-white rounded-md transition-colors flex items-center gap-2
                      ${
                        distributionZones.length > 0
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    Distribute Anchors
                  </button>

                  {anchors.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleReduceAnchors}
                        disabled={additionalAnchors <= 0}
                        className={`px-4 py-2 text-white rounded-md transition-colors flex items-center gap-2
                          ${
                            additionalAnchors > 0
                              ? "bg-indigo-600 hover:bg-indigo-700"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                        Remove 5
                      </button>

                      <button
                        onClick={handleAddAnchors}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Add 5
                      </button>

                      <div className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-600">
                        Added: {additionalAnchors}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowZones(!showZones)}
                    className={`px-4 py-2 text-white rounded-md transition-colors flex items-center gap-2
                      ${showZones ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-500 hover:bg-gray-600"}`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {showZones ? "Hide Zones" : "Show Zones"}
                  </button>
                </div>

                {anchors.length > 0 && (
                  <div className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      />
                    </svg>
                    <span>Anchors: {anchors.length}</span>
                  </div>
                )}
              </div>
            </div>
            <div
              className="relative w-full h-[600px] border rounded-lg overflow-hidden"
              onClick={handleManualAnchorAdd}
              onMouseMove={handleAnchorDrag}
              onMouseUp={handleAnchorDragEnd}
              onMouseLeave={handleAnchorDragEnd}
              style={{
                cursor: isManualMode ? "crosshair" : "default",
                userSelect: "none",
              }}
            >
              <img
                ref={imageRef}
                src={fileUrl}
                className="w-full h-full object-contain pointer-events-none"
                alt="Blueprint"
              />
              {isDrawingZone && (
                <SelectionZone onZoneSelected={handleZoneSelection} />
              )}
              {showZones &&
                distributionZones.map((zone) => (
                  <div
                    key={zone.id}
                    className="absolute border-2 border-green-500 bg-green-500/20 group"
                    style={{
                      left: `${zone.x}%`,
                      top: `${zone.y}%`,
                      width: `${zone.width}%`,
                      height: `${zone.height}%`,
                    }}
                  >
                    <div className="absolute -top-7 left-0 flex items-center gap-2">
                      <span className="text-green-700 font-medium text-lg opacity-70 whitespace-nowrap">
                        {zone.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteZone(zone.id);
                        }}
                        className="hidden group-hover:flex items-center justify-center w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              {anchors.map((anchor) => (
                <div
                  key={anchor.id}
                  className={`absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-move
                    ${anchor.isManual ? "bg-purple-500 ring-2 ring-purple-300" : "bg-blue-500"}
                    ${draggedAnchor === anchor.id ? "ring-2 ring-yellow-300 scale-125" : ""}
                    hover:ring-2 hover:ring-yellow-300 hover:scale-110 transition-all`}
                  style={{
                    left: `${anchor.x}%`,
                    top: `${anchor.y}%`,
                  }}
                  onMouseDown={() => handleAnchorDragStart(anchor.id)}
                  onMouseUp={handleAnchorDragEnd}
                />
              ))}
            </div>
          </div>
          {pendingZone && (
            <ZoneNameDialog
              defaultName={`Zone ${distributionZones.length + 1}`}
              onConfirm={handleZoneNameConfirm}
              onCancel={() => setPendingZone(null)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default FileViewer;
