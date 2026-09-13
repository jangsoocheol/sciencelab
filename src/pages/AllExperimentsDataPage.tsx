import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { listActiveExperiments } from "../lib/experiments";
import { listSubmissionsByExperiment, getSubmissionDownloadUrl } from "../lib/submissions";
import { DataPreview } from "../components/DataPreview";
import type { Experiment } from "../types/experiment";
import type { Submission } from "../types/submission";

export function AllExperimentsDataPage() {
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const [experiments, setExperiments] = useState<Array<Experiment & { id: string }>>([]);
  const [selectedExperimentId, setSelectedExperimentId] = useState("");
  const [submissions, setSubmissions] = useState<Array<Submission & { id: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<Record<string, string>>({});

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

  async function handleExperimentChange(experimentId: string) {
    setSelectedExperimentId(experimentId);
    if (!experimentId) {
      setSubmissions([]);
      return;
    }

    setLoading(true);
    setSubmissions([]);
    setPreviewImages({});
    try {
      const list = await listSubmissionsByExperiment(experimentId);
      setSubmissions(list);
      for (const submission of list) {
        if (submission.previewStoragePath) {
          loadPreviewImage(submission.id, submission.previewStoragePath);
        }
      }
    } catch (err) {
      console.error(err);
      setError("데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  }

  async function loadPreviewImage(submissionId: string, path: string) {
    try {
      const blob = await getSubmissionDownloadUrl(path);
      const url = URL.createObjectURL(blob);
      setPreviewImages((prev) => ({ ...prev, [submissionId]: url }));
    } catch (err) {
      console.error("Failed to load preview image:", err);
    }
  }

  async function handleDownload(submission: Submission) {
    if (submission.uid !== firebaseUser?.uid) {
      setError("자신의 데이터만 다운로드할 수 있습니다.");
      return;
    }

    try {
      const blob = await getSubmissionDownloadUrl(submission.storagePath);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = submission.fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("다운로드 실패");
    }
  }

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h1 style={{ margin: 0 }}>전체 실험 데이터</h1>
        <button onClick={() => navigate("/")} style={{ padding: "8px 16px", fontSize: "0.9rem" }}>홈</button>
      </div>

      <label>
        실험 선택
        <select
          value={selectedExperimentId}
          onChange={(e) => handleExperimentChange(e.target.value)}
        >
          <option value="">-- 실험을 선택해 주세요 --</option>
          {experiments.map((exp) => (
            <option key={exp.id} value={exp.id}>
              {exp.name}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p>로드 중...</p>
      ) : submissions.length === 0 && selectedExperimentId ? (
        <p>이 실험의 제출 데이터가 없습니다.</p>
      ) : (
        <div className="submissions-list">
          {submissions.map((submission) => (
            <div key={submission.id} className="submission-item">
              <h3>{submission.studentName} ({submission.studentId})</h3>
              <p>{submission.fileName}</p>
              <p>실험 날짜: {submission.experimentDate}</p>

              <DataPreview
                previewData={submission.previewData}
                previewImageUrl={previewImages[submission.id]}
                fileName={submission.fileName}
              />

              {submission.uid === firebaseUser?.uid && (
                <button onClick={() => handleDownload(submission)}>원본 다운로드</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
