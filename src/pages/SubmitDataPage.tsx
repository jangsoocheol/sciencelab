import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { createSubmission } from "../lib/submissions";
import { parseSpreadsheetFile } from "../lib/spreadsheet";
import { createResizedImage } from "../lib/imagePreview";
import { listActiveExperiments } from "../lib/experiments";
import type { Experiment } from "../types/experiment";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_SPREADSHEET_SIZE = 5 * 1024 * 1024;

export function SubmitDataPage() {
  const navigate = useNavigate();
  const { firebaseUser, profile } = useAuth();
  const [experiments, setExperiments] = useState<Array<Experiment & { id: string }>>([]);
  const [selectedExperimentId, setSelectedExperimentId] = useState("");
  const [experimentDate, setExperimentDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    loadExperiments();
  }, []);

  async function loadExperiments() {
    try {
      const list = await listActiveExperiments();
      setExperiments(list);
    } catch (err) {
      console.error(err);
      setError("실험 목록 로드 실패");
    }
  }

  function validateAndSetFile(file: File) {
    setError(null);
    setSuccess(null);

    const ext = file.name.split(".").pop()?.toLowerCase();
    const isImage = ["jpg", "jpeg", "png"].includes(ext || "");
    const isSpreadsheet = ["csv", "xlsx"].includes(ext || "");

    if (!isImage && !isSpreadsheet) {
      setError("CSV, XLSX, 또는 이미지(JPG/PNG) 파일만 허용합니다.");
      return;
    }

    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_SPREADSHEET_SIZE;
    if (file.size > maxSize) {
      setError(
        `파일이 너무 큽니다. (최대: ${isImage ? "10MB" : "5MB"})`
      );
      return;
    }

    setSelectedFile(file);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndSetFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    validateAndSetFile(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedExperimentId || !experimentDate || !selectedFile || !firebaseUser || !profile) {
      setError("모든 항목을 입력해 주세요.");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "";
      const isImage = ["jpg", "jpeg", "png"].includes(ext);
      const isSpreadsheet = ["csv", "xlsx"].includes(ext);

      let previewData;
      let previewBlob;

      if (isSpreadsheet) {
        previewData = await parseSpreadsheetFile(selectedFile);
      } else if (isImage) {
        previewBlob = await createResizedImage(selectedFile);
      }

      await createSubmission(
        firebaseUser.uid,
        selectedExperimentId,
        profile.studentId,
        profile.name,
        experimentDate,
        selectedFile,
        ext,
        previewData,
        previewBlob
      );

      setSuccess("파일이 업로드되었습니다!");
      setSelectedFile(null);
      setSelectedExperimentId("");
      setExperimentDate("");
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) input.value = "";
    } catch (err) {
      console.error(err);
      setError("업로드 실패. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>실험 데이터 제출</h1>
        <button onClick={() => navigate("/")} style={{ padding: "8px 16px", fontSize: "0.9rem" }}>홈</button>
      </div>

      <form onSubmit={handleSubmit} className="form" style={{ flex: 1 }}>
        <label>
          실험 선택
          <select
            value={selectedExperimentId}
            onChange={(e) => setSelectedExperimentId(e.target.value)}
            required
          >
            <option value="">-- 실험을 선택해 주세요 --</option>
            {experiments.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          실험 날짜
          <input type="date" value={experimentDate} onChange={(e) => setExperimentDate(e.target.value)} />
        </label>

        <div
          style={{
            border: `2px dashed ${isDragOver ? "var(--primary)" : "var(--border)"}`,
            borderRadius: "8px",
            padding: "24px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s",
            background: isDragOver ? "rgba(99, 102, 241, 0.05)" : "transparent",
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label style={{ cursor: "pointer", display: "block" }}>
            <div style={{ marginBottom: "8px" }}>
              {selectedFile ? (
                <>
                  <p style={{ fontWeight: 600, margin: "0 0 8px 0" }}>✓ {selectedFile.name}</p>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-light)", margin: 0 }}>
                    다시 클릭하거나 드래그해서 변경
                  </p>
                </>
              ) : (
                <>
                  <p style={{ fontWeight: 600, margin: "0 0 8px 0" }}>파일을 여기에 드래그하거나 클릭</p>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-light)", margin: 0 }}>
                    CSV, XLSX, JPG, PNG (최대 10MB)
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".csv,.xlsx,.jpg,.jpeg,.png"
              style={{ display: "none" }}
            />
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "업로드 중..." : "업로드"}
        </button>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
      </form>

      <Link to="/my-data" style={{ width: "100%" }}>
        <button style={{ width: "100%", padding: "14px 16px" }}>내 데이터 확인(그래프)</button>
      </Link>
    </div>
  );
}
