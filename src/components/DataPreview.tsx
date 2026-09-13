import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { PreviewData } from "../types/submission";

interface DataPreviewProps {
  previewData?: PreviewData;
  previewImageUrl?: string;
  fileName: string;
}

export function DataPreview({ previewData, previewImageUrl, fileName }: DataPreviewProps) {
  if (previewImageUrl) {
    return (
      <div className="preview-container">
        <img src={previewImageUrl} alt={fileName} className="preview-image" />
      </div>
    );
  }

  if (!previewData) {
    return <p>미리보기 없음</p>;
  }

  // rows가 JSON 문자열로 저장된 경우 파싱
  let rows: (string | number)[][] = [];
  if (typeof previewData.rows === "string") {
    try {
      rows = JSON.parse(previewData.rows);
    } catch {
      return <p>데이터 파싱 오류</p>;
    }
  } else {
    rows = previewData.rows;
  }

  const numericColumns = previewData.columns.filter((_col, idx) =>
    rows.some((row) => typeof row[idx] === "number")
  );

  const chartData = rows.map((row) => {
    const obj: any = {};
    previewData.columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });

  return (
    <div className="preview-container">
      <div className="preview-table">
        <table>
          <thead>
            <tr>
              {previewData.columns.map((_col, idx) => (
                <th key={idx}>{_col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 10).map((row, idx) => (
              <tr key={idx}>
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > 10 && <p>... (더보기)</p>}
      </div>

      {numericColumns.length > 0 && (
        <div className="preview-chart">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={previewData.columns[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              {numericColumns.slice(0, 3).map((col) => (
                <Line key={col} type="monotone" dataKey={col} stroke={randomColor()} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function randomColor() {
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c"];
  return colors[Math.floor(Math.random() * colors.length)];
}
