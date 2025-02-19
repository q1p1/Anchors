import { DensityZone } from "../../types";

interface DensityZonePopupProps {
  zone: DensityZone;
  onClose: () => void;
  onUpdate: (id: string, changes: Partial<DensityZone>) => void;
  coverage: number;
}

const DensityZonePopup = ({
  zone,
  onClose,
  onUpdate,
  coverage,
}: DensityZonePopupProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90%] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {zone.name || "Density Zone"}
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone Name
            </label>
            <input
              type="text"
              value={zone.name}
              onChange={(e) => onUpdate(zone.id, { name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter zone name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Workers
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                value={zone.workers}
                onChange={(e) =>
                  onUpdate(zone.id, { workers: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="text-sm text-gray-500">workers</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3">Zone Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Coverage:</span>
                <span
                  className={
                    coverage >= 95 ? "text-green-600" : "text-yellow-600"
                  }
                >
                  {coverage.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Required Anchors:</span>
                <span>{Math.ceil(zone.workers / 10)}</span>
              </div>
              <div className="flex justify-between">
                <span>Area:</span>
                <span>{Math.round(zone.width * zone.height)} m²</span>
              </div>
              <div className="flex justify-between">
                <span>Worker Density:</span>
                <span>
                  {(zone.workers / (zone.width * zone.height)).toFixed(2)}{" "}
                  workers/m²
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DensityZonePopup;
