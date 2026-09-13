import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile, UserRole } from "../types/user";

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/**
 * PRD 6-2: role은 config/teacherEmails.allowedEmails 화이트리스트로만 결정된다.
 * NOTE: Phase 5(Security Rules)가 적용되기 전까지는 이 판별을 클라이언트가 그대로 신뢰하므로
 * 강제력이 없다. Rules가 배포된 뒤에야 role 위조가 실제로 차단된다.
 */
export async function determineRole(email: string | null): Promise<UserRole> {
  if (!email) return "student";
  const snap = await getDoc(doc(db, "config", "teacherEmails"));
  const allowedEmails: string[] = snap.exists() ? snap.data().allowedEmails ?? [] : [];
  return allowedEmails.includes(email) ? "teacher" : "student";
}

export async function createUserProfile(
  uid: string,
  input: { name: string; studentId: string; role: UserRole }
): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
