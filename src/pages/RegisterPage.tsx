import { useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createUserProfile, determineRole } from "../lib/userProfile";

export function RegisterPage() {
  const { firebaseUser, refreshProfile } = useAuth();
  const [name, setName] = useState(firebaseUser?.displayName ?? "");
  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!firebaseUser) return;
    setError(null);

    const gradeNumber = Number(grade);
    if (!name.trim() || !className.trim() || !studentId.trim() || !gradeNumber) {
      setError("모든 항목을 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const role = await determineRole(firebaseUser.email);
      await createUserProfile(firebaseUser.uid, {
        name: name.trim(),
        studentId: studentId.trim(),
        className: className.trim(),
        grade: gradeNumber,
        role,
      });
      await refreshProfile();
    } catch (err) {
      console.error(err);
      setError("등록에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page page-centered">
      <h1>정보 등록</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          이름
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          학년
          <input
            type="number"
            inputMode="numeric"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
          />
        </label>
        <label>
          반
          <input value={className} onChange={(e) => setClassName(e.target.value)} required />
        </label>
        <label>
          학번
          <input value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "등록 중..." : "등록"}
        </button>
        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
}
