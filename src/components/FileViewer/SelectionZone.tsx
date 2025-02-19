import React, { useState, useCallback } from 'react';

interface SelectionZoneProps {
  onZoneSelected: (zone: { x: number; y: number; width: number; height: number }) => void;
}

const SelectionZone: React.FC<SelectionZoneProps> = ({ onZoneSelected }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setStartPos({ x, y });
    setCurrentPos({ x, y });
    setIsDrawing(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentPos({ x, y });
  }, [isDrawing]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const zone = {
      x: Math.min(startPos.x, currentPos.x),
      y: Math.min(startPos.y, currentPos.y),
      width: Math.abs(currentPos.x - startPos.x),
      height: Math.abs(currentPos.y - startPos.y),
    };
    onZoneSelected(zone);
  }, [isDrawing, startPos, currentPos, onZoneSelected]);

  return (
    <div
      className="absolute inset-0 cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {isDrawing && (
        <div
          className="absolute border-2 border-green-500 bg-green-500/20"
          style={{
            left: `${Math.min(startPos.x, currentPos.x)}%`,
            top: `${Math.min(startPos.y, currentPos.y)}%`,
            width: `${Math.abs(currentPos.x - startPos.x)}%`,
            height: `${Math.abs(currentPos.y - startPos.y)}%`,
          }}
        />
      )}
    </div>
  );
};

export default SelectionZone; 