export type UserRole = "student" | "teacher";

export interface UserProfile {
  name: string;
  studentId: string;
  className: string;
  grade: number;
  role: UserRole;
  createdAt: unknown;
  updatedAt: unknown;
}
