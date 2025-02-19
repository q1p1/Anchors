const ProjectSetup = ({
  onProjectSetup,
}: {
  onProjectSetup: (area: number) => void;
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const area = Number(formData.get("area"));

    if (area && area > 0) {
      onProjectSetup(area);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Project Setup</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="area"
            className="block text-sm font-medium text-gray-700"
          >
            Project Area (m²)
          </label>
          <input
            type="number"
            name="area"
            id="area"
            required
            min="1"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter project area"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue to Upload Blueprint
        </button>
      </form>
    </div>
  );
};

export default ProjectSetup;
