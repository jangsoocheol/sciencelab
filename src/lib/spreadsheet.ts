import * as XLSX from "xlsx";
import type { PreviewData } from "../types/submission";

export async function parseSpreadsheetFile(file: File): Promise<PreviewData> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!worksheet) throw new Error("No sheet found");

  const data: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    blankrows: false,
    raw: true,
  }) as unknown[][];

  if (data.length === 0) throw new Error("Empty sheet");

  const columns = (data[0] as string[]).map((col) => String(col).trim());
  const rows = data.slice(1).map((row) =>
    row.map((cell) => {
      if (typeof cell === "number") return cell;
      const num = Number(cell);
      return isNaN(num) ? String(cell) : num;
    })
  );

  return { columns, rows };
}
