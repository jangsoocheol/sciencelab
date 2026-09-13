import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createExperiment, listAllExperiments, setExperimentActive } from "../lib/experiments";
import type { Experiment } from "../types/experiment";

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
              <button onClick={() => handleToggleActive(exp.id, exp.active)}>
                {exp.active ? "비활성화" : "활성화"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
