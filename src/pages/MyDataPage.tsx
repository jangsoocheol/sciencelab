import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { listMySubmissions, deleteSubmission, getSubmissionDownloadUrl } from "../lib/submissions";
import { DataPreview } from "../components/DataPreview";
import type { Submission } from "../types/submission";

export function MyDataPage() {
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const [submissions, setSubmissions] = useState<Array<Submission & { id: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (firebaseUser) {
      loadSubmissions();
    }
  }, [firebaseUser]);

  async function loadSubmissions() {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const list = await listMySubmissions(firebaseUser.uid);
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

  async function handleDelete(submissionId: string, submission: Submission) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteSubmission(submissionId, submission);
      await loadSubmissions();
    } catch (err) {
      console.error(err);
      setError("삭제 실패");
    }
  }

  async function handleDownload(submission: Submission) {
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
        <h1 style={{ margin: 0 }}>내 데이터</h1>
        <button onClick={() => navigate("/")} style={{ padding: "8px 16px", fontSize: "0.9rem" }}>홈</button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p>로드 중...</p>
      ) : submissions.length === 0 ? (
        <p>업로드한 데이터가 없습니다.</p>
      ) : (
        <div className="submissions-list">
          {submissions.map((submission) => (
            <div key={submission.id} className="submission-item">
              <h3>{submission.fileName}</h3>
              <p>실험 날짜: {submission.experimentDate}</p>

              <DataPreview
                previewData={submission.previewData}
                previewImageUrl={previewImages[submission.id]}
                fileName={submission.fileName}
              />

              <div className="submission-actions">
                <button onClick={() => handleDownload(submission)}>원본 다운로드</button>
                <button onClick={() => handleDelete(submission.id, submission)} className="delete-btn">
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
