import React, { useState, useRef } from "react";
import ProjectSetup from "./ProjectSetup";
import FileInput from "./FileInput";
import SelectionZone from "./SelectionZone";
import { Anchor } from "../../types";
import ZoneNameDialog from "./ZoneNameDialog";
const ANCHOR_DIAMETER = 5; // meters

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

  const handleProjectSetup = (area: number) => {
    setProjectArea(area);
    setIsProjectSetup(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    }
  };

  const handleStartDrawingZone = () => {
    setIsDrawingZone(true);
    setAnchors([]);
  };

  const handleZoneSelection = (zone: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    setPendingZone(zone);
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
            });
          }
        }
      }
    });

    setAnchors(newAnchors);
    setShowZones(false); // Hide zones after distribution
  };

  const handleAddAnchors = () => {
    setAdditionalAnchors((prev) => prev + 5);
    distributeAnchors();
  };

  return (
    <div className="p-4 space-y-4">
      {!isProjectSetup ? (
        // Project Setup Phase
        <ProjectSetup onProjectSetup={handleProjectSetup} />
      ) : !fileUrl ? (
        // File Upload Phase
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Project Area: {projectArea} m²
            </h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload Project Blueprint
              </label>
              <FileInput onFileUpload={handleFileUpload} />
            </div>
          </div>
        </div>
      ) : (
        // Image Display and Distribution Phase
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Project Area: {projectArea} m²
              </h2>
              <div className="space-x-4">
                <button
                  onClick={handleStartDrawingZone}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Distribution Zone
                </button>
                <button
                  onClick={() => setShowZones(!showZones)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  {showZones ? "Hide" : "Show"} Zones
                </button>
                <button
                  onClick={handleDistribute}
                  disabled={distributionZones.length === 0}
                  className={`px-4 py-2 text-white rounded-md transition-colors ${
                    distributionZones.length > 0
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Distribute Anchors
                </button>
                {anchors.length > 0 && (
                  <button
                    onClick={handleAddAnchors}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Add More Anchors (+5)
                  </button>
                )}
                {anchors.length > 0 && (
                  <span className="text-gray-600">
                    Total Anchors: {anchors.length}
                  </span>
                )}
              </div>
            </div>
            <div className="relative w-full h-[600px] border rounded-lg overflow-hidden">
              <img
                ref={imageRef}
                src={fileUrl}
                className="w-full h-full object-contain"
                alt="Blueprint"
              />
              {isDrawingZone && (
                <SelectionZone onZoneSelected={handleZoneSelection} />
              )}
              {showZones &&
                distributionZones.map((zone, index) => (
                  <div
                    key={`zone-${index}`}
                    className="absolute border-2 border-green-500 bg-green-500/20"
                    style={{
                      left: `${zone.x}%`,
                      top: `${zone.y}%`,
                      width: `${zone.width}%`,
                      height: `${zone.height}%`,
                    }}
                  >
                    <div className="absolute -top-7 left-0 text-green-700 font-medium text-lg opacity-70 whitespace-nowrap">
                      {zone.name}
                    </div>
                  </div>
                ))}
              {anchors.map((anchor) => (
                <div
                  key={anchor.id}
                  className="absolute w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${anchor.x}%`,
                    top: `${anchor.y}%`,
                  }}
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
