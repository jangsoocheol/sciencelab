import { signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import { auth } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";

export function HomePage() {
  const { profile } = useAuth();
  if (!profile) return null;

  return (
    <div className="page page-centered">
      <h1>Science Lab Data</h1>
      <p>
        {profile.name} · {profile.studentId}번
      </p>

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
