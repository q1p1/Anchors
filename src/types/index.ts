export interface Anchor {
  id: string;
  x: number;
  y: number;
  diameter: number;
}

export interface AnchorProps {
  anchor: Anchor;
  scale: number;
}

export interface FileInputProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface FileDisplayProps {
  fileUrl: string;
  onLoad: () => void;
}
