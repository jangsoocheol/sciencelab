import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { deleteObject, getBytes, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase";
import type { PreviewData, Submission } from "../types/submission";

export async function createSubmission(
  uid: string,
  experimentId: string,
  studentId: string,
  studentName: string,
  file: File,
  fileType: string,
  previewData?: PreviewData,
  previewBlob?: Blob
): Promise<string> {
  const docRef = await addDoc(collection(db, "submissions"), {
    uid,
    experimentId,
    studentId,
    studentName,
    fileName: file.name,
    fileType,
    fileSize: file.size,
    storagePath: "",
    previewData,
    previewStoragePath: previewBlob ? "" : undefined,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const submissionId = docRef.id;
  const storagePath = `submissions/${uid}/${experimentId}/${submissionId}/original.${fileType}`;

  await uploadBytes(ref(storage, storagePath), file);

  let previewStoragePath: string | undefined;
  if (previewBlob) {
    const previewPath = `previews/${uid}/${experimentId}/${submissionId}/preview.${fileType}`;
    await uploadBytes(ref(storage, previewPath), previewBlob);
    previewStoragePath = previewPath;
  }

  await updateSubmissionPaths(submissionId, storagePath, previewStoragePath);
  return submissionId;
}

async function updateSubmissionPaths(
  submissionId: string,
  storagePath: string,
  previewStoragePath?: string
): Promise<void> {
  const docRef = doc(db, "submissions", submissionId);
  const updates: any = { storagePath };
  if (previewStoragePath !== undefined) {
    updates.previewStoragePath = previewStoragePath;
  }
  await (await import("firebase/firestore")).updateDoc(docRef, updates);
}

export async function deleteSubmission(submissionId: string, submission: Submission): Promise<void> {
  await deleteDoc(doc(db, "submissions", submissionId));
  try {
    await deleteObject(ref(storage, submission.storagePath));
  } catch (e) {
    console.error("Failed to delete original file:", e);
  }
  if (submission.previewStoragePath) {
    try {
      await deleteObject(ref(storage, submission.previewStoragePath));
    } catch (e) {
      console.error("Failed to delete preview file:", e);
    }
  }
}

export async function listMySubmissions(uid: string): Promise<Array<Submission & { id: string }>> {
  const q = query(collection(db, "submissions"), where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Submission & { id: string }));
}

export async function listSubmissionsByExperiment(
  experimentId: string
): Promise<Array<Submission & { id: string }>> {
  const q = query(collection(db, "submissions"), where("experimentId", "==", experimentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Submission & { id: string }));
}

export async function getSubmissionDownloadUrl(storagePath: string): Promise<Blob> {
  const bytes = await getBytes(ref(storage, storagePath));
  return new Blob([bytes]);
}
