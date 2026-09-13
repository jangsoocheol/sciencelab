export type FileKind = "csv" | "xlsx" | "jpg" | "jpeg" | "png";

export interface PreviewData {
  columns: string[];
  rows: (string | number)[][] | string;
}

export interface Submission {
  uid: string;
  experimentId: string;
  studentId: string;
  studentName: string;
  experimentDate: string;
  fileName: string;
  fileType: FileKind;
  fileSize: number;
  storagePath: string;
  previewData?: PreviewData;
  previewStoragePath?: string;
  createdAt: unknown;
  updatedAt: unknown;
}
