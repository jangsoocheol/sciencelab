export type UserRole = "student" | "teacher";

export interface UserProfile {
  name: string;
  studentId: string;
  role: UserRole;
  createdAt: unknown;
  updatedAt: unknown;
}
