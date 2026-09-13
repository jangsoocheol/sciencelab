import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createExperiment, listAllExperiments, setExperimentActive } from "../lib/experiments";
import { listSubmissionsByExperiment, getSubmissionDownloadUrl } from "../lib/submissions";
import { DataPreview } from "../components/DataPreview";
import type { Experiment } from "../types/experiment";
import type { Submission } from "../types/submission";

export function TeacherDashboardPage() {
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState<Array<Experiment & { id: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Array<Submission & { id: string }>>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<Record<string, string>>({});

  useEffect(() => {
    loadExperiments();
  }, []);

  async function loadExperiments() {
    setLoading(true);
    try {
      const list = await listAllExperiments();
      setExperiments(list);
    } catch (err) {
      console.error(err);
      setError("실험 목록 로드 실패");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !subject.trim() || !grade.trim()) {
      setError("모든 항목을 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await createExperiment({
        name: name.trim(),
        description: description.trim(),
        subject: subject.trim(),
        grade: Number(grade),
        active: true,
      });
      setName("");
      setDescription("");
      setSubject("");
      setGrade("");
      await loadExperiments();
    } catch (err) {
      console.error(err);
      setError("실험 생성 실패");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    try {
      await setExperimentActive(id, !active);
      await loadExperiments();
    } catch (err) {
      console.error(err);
      setError("상태 변경 실패");
    }
  }

  async function handleViewData(experimentId: string) {
    if (selectedExperimentId === experimentId) {
      setSelectedExperimentId(null);
      setSubmissions([]);
      return;
    }

    setSelectedExperimentId(experimentId);
    setSubmissionsLoading(true);
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
      setSubmissionsLoading(false);
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
        <h1 style={{ margin: 0 }}>실험 관리</h1>
        <button onClick={() => navigate("/")} style={{ padding: "8px 16px", fontSize: "0.9rem" }}>홈</button>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <label>
          실험명
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          설명
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </label>
        <label>
          과목
          <input value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </label>
        <label>
          대상 학년
          <input
            type="number"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "생성 중..." : "실험 추가"}
        </button>
        {error && <p className="error-text">{error}</p>}
      </form>

      <hr />

      <h2>전체 실험 목록</h2>
      {loading ? (
        <p>로드 중...</p>
      ) : (
        <div className="experiments-list">
          {experiments.map((exp) => (
            <div key={exp.id} className="experiment-item">
              <h3>{exp.name}</h3>
              <p>{exp.description}</p>
              <p>과목: {exp.subject} | 학년: {exp.grade}</p>
              <p>상태: {exp.active ? "활성" : "비활성"}</p>
              <div className="submission-actions">
                <button onClick={() => handleToggleActive(exp.id, exp.active)}>
                  {exp.active ? "비활성화" : "활성화"}
                </button>
                <button onClick={() => handleViewData(exp.id)}>
                  {selectedExperimentId === exp.id ? "접기" : "데이터 조회"}
                </button>
              </div>

              {selectedExperimentId === exp.id && (
                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                  {submissionsLoading ? (
                    <p>로드 중...</p>
                  ) : submissions.length === 0 ? (
                    <p>제출된 데이터가 없습니다.</p>
                  ) : (
                    <div className="submissions-list" style={{ marginTop: "12px" }}>
                      {submissions.map((submission) => (
                        <div key={submission.id} style={{ padding: "12px", background: "var(--bg)", borderRadius: "8px" }}>
                          <h4 style={{ margin: "0 0 8px 0" }}>{submission.studentName} ({submission.studentId})</h4>
                          <p style={{ fontSize: "0.9rem", color: "var(--text-light)", margin: "0 0 8px 0" }}>
                            실험 날짜: {submission.experimentDate} | 파일: {submission.fileName}
                          </p>

                          <DataPreview
                            previewData={submission.previewData}
                            previewImageUrl={previewImages[submission.id]}
                            fileName={submission.fileName}
                          />

                          <button onClick={() => handleDownload(submission)} style={{ marginTop: "8px", fontSize: "0.9rem", padding: "8px 12px" }}>
                            원본 다운로드
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
