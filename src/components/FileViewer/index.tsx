import React, { useState, useRef } from "react";
import ProjectSetup from "./ProjectSetup";
import FileInput from "./FileInput";
import SelectionZone from "./SelectionZone";
import { Anchor } from "../../types";
const ANCHOR_DIAMETER = 7.1; // meters

const FileViewer = () => {
  const [projectArea, setProjectArea] = useState<number>(0);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [isProjectSetup, setIsProjectSetup] = useState<boolean>(false);
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawingZone, setIsDrawingZone] = useState<boolean>(false);
  const [distributionZones, setDistributionZones] = useState<
    Array<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>
  >([]);
  const [showZones, setShowZones] = useState<boolean>(true);

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
    setDistributionZones((prev) => [...prev, zone]);
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

    // Calculate aspect ratios
    const imageRatio = imageWidth / imageHeight;
    const containerRatio = containerWidth / containerHeight;

    // Calculate display dimensions
    let displayWidth: number;
    let displayHeight: number;
    let offsetX: number;
    let offsetY: number;

    if (imageRatio > containerRatio) {
      // Image is wider
      displayWidth = containerWidth;
      displayHeight = containerWidth / imageRatio;
      offsetX = 0;
      offsetY = (containerHeight - displayHeight) / 2;
    } else {
      // Image is taller
      displayHeight = containerHeight;
      displayWidth = containerHeight * imageRatio;
      offsetX = (containerWidth - displayWidth) / 2;
      offsetY = 0;
    }

    // Calculate scale (meters/pixel)
    const metersPerPixel = Math.sqrt(projectArea / (imageWidth * imageHeight));
    const minDistancePixels = ANCHOR_DIAMETER / metersPerPixel;
    const requiredAnchors = Math.ceil(projectArea / 75);

    const newAnchors: Anchor[] = [];

    const isValidPosition = (x: number, y: number): boolean => {
      return newAnchors.every((anchor) => {
        const dx = (anchor.x / 100) * displayWidth - x;
        const dy = (anchor.y / 100) * displayHeight - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance >= minDistancePixels;
      });
    };

    let attempts = 0;
    const maxAttempts = requiredAnchors * 200;

    while (newAnchors.length < requiredAnchors && attempts < maxAttempts) {
      // Select random zone
      const randomZone =
        distributionZones[Math.floor(Math.random() * distributionZones.length)];

      // Generate random position within selected zone
      const x =
        offsetX +
        (randomZone.x / 100) * displayWidth +
        Math.random() * (randomZone.width / 100) * displayWidth;
      const y =
        offsetY +
        (randomZone.y / 100) * displayHeight +
        Math.random() * (randomZone.height / 100) * displayHeight;

      const xPercent = ((x - offsetX) / displayWidth) * 100;
      const yPercent = ((y - offsetY) / displayHeight) * 100;

      // Check if position is within zone bounds
      if (
        xPercent >= randomZone.x &&
        xPercent <= randomZone.x + randomZone.width &&
        yPercent >= randomZone.y &&
        yPercent <= randomZone.y + randomZone.height
      ) {
        if (isValidPosition(x, y)) {
          newAnchors.push({
            id: `anchor-${newAnchors.length}`,
            x: xPercent,
            y: yPercent,
            diameter: ANCHOR_DIAMETER,
          });
        }
      }
      attempts++;
    }

    setAnchors(newAnchors);
    setShowZones(false); // Hide zones after distribution
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
                  />
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
        </div>
      )}
    </div>
  );
};

export default FileViewer;
