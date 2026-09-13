import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";

export function HomePage() {
  const { profile } = useAuth();
  if (!profile) return null;

  return (
    <div className="page page-centered">
      <h1>Science Lab Data</h1>
      <p>
        {profile.name} · {profile.grade}학년 {profile.className}반 {profile.studentId}번
      </p>

      {profile.role === "teacher" ? (
        <nav className="nav-list">
          <button disabled>Teacher Dashboard (준비 중)</button>
        </nav>
      ) : (
        <nav className="nav-list">
          <button disabled>실험 데이터 제출 (준비 중)</button>
          <button disabled>내 데이터 (준비 중)</button>
          <button disabled>전체 실험 데이터 (준비 중)</button>
        </nav>
      )}

      <button onClick={() => signOut(auth)}>로그아웃</button>
    </div>
  );
}
