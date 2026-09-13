import { signOut } from "firebase/auth";
import { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { updateUserProfile } from "../lib/userProfile";

export function HomePage() {
  const { profile, firebaseUser, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.name || "");
  const [editStudentId, setEditStudentId] = useState(profile?.studentId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return null;

  async function handleSaveProfile() {
    if (!editName || !editStudentId || !firebaseUser) {
      setError("모든 항목을 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateUserProfile(firebaseUser.uid, {
        name: editName,
        studentId: editStudentId,
      });
      await refreshProfile();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("프로필 수정 실패. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page page-centered">
      <h1>Science Lab Data</h1>

      {isEditing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontWeight: 500 }}>
            이름
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontWeight: 500 }}>
            학번
            <input
              type="text"
              value={editStudentId}
              onChange={(e) => setEditStudentId(e.target.value)}
              style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px" }}
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleSaveProfile} disabled={loading} style={{ flex: 1 }}>
              {loading ? "저장 중..." : "저장"}
            </button>
            <button onClick={() => { setIsEditing(false); setEditName(profile.name); setEditStudentId(profile.studentId); setError(null); }} style={{ flex: 1, background: "var(--text-light)" }}>
              취소
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
          <p>
            {profile.name} · {profile.studentId}번
          </p>
          <button onClick={() => setIsEditing(true)} style={{ fontSize: "0.9rem", padding: "8px 16px" }}>
            프로필 수정
          </button>
        </div>
      )}

      {profile.role === "teacher" ? (
        <nav className="nav-list">
          <Link to="/teacher">
            <button>Teacher Dashboard</button>
          </Link>
        </nav>
      ) : (
        <nav className="nav-list">
          <Link to="/submit">
            <button>실험 데이터 제출</button>
          </Link>
          <Link to="/my-data">
            <button>내 데이터</button>
          </Link>
          <Link to="/experiments">
            <button>전체 실험 데이터</button>
          </Link>
        </nav>
      )}

      <button onClick={() => signOut(auth)}>로그아웃</button>
    </div>
  );
}
