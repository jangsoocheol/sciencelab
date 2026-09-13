import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { auth } from "../lib/firebase";

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      console.error(err);
      setError("로그인에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page page-centered">
      <h1>Science Lab Data</h1>
      <button onClick={handleLogin} disabled={submitting}>
        {submitting ? "로그인 중..." : "Google로 로그인"}
      </button>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
