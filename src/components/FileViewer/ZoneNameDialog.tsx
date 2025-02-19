import { useState } from "react";

interface ZoneNameDialogProps {
  defaultName: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

const ZoneNameDialog = ({
  defaultName,
  onConfirm,
  onCancel,
}: ZoneNameDialogProps) => {
  const [name, setName] = useState(defaultName);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90%]">
        <h2 className="text-xl font-semibold mb-4">Enter Zone Name</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
          placeholder="Enter zone name"
          autoFocus
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(name)}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZoneNameDialog;
