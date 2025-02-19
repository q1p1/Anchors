export interface Anchor {
  isManual: unknown;
  id: string;
  x: number;
  y: number;
  diameter: number;
  isDensityAnchor?: boolean;
}

export interface ExclusionZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnchorProps {
  anchor: Anchor;
  scale: number;
  onDragStart?: (e: React.MouseEvent<HTMLDivElement>, id: string) => void;
  onDrag?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  onDelete?: (id: string) => void;
  exclusionZones?: ExclusionZone[];
}

export interface FileInputProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface FileDisplayProps {
  fileUrl: string;
  onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export interface DensityZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  workers: number;
  area?: number;
}
