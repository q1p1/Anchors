import { FileDisplayProps } from "../../types";

const FileDisplay = ({ fileUrl, onLoad }: FileDisplayProps) => {
  return (
    <img
      src={fileUrl}
      alt="Project area"
      className="w-full h-full object-contain"
      onLoad={onLoad}
    />
  );
};

export default FileDisplay;
