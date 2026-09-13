import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Experiment } from "../types/experiment";

export async function listActiveExperiments(): Promise<
  Array<Experiment & { id: string }>
> {
  const q = query(collection(db, "experiments"), where("active", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Experiment & { id: string }));
}

export async function listAllExperiments(): Promise<
  Array<Experiment & { id: string }>
> {
  const snap = await getDocs(collection(db, "experiments"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Experiment & { id: string }));
}

export async function createExperiment(
  input: Omit<Experiment, "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "experiments"), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateExperiment(
  id: string,
  updates: Partial<Omit<Experiment, "createdAt" | "updatedAt">>
): Promise<void> {
  await updateDoc(doc(db, "experiments", id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function setExperimentActive(id: string, active: boolean): Promise<void> {
  await updateDoc(doc(db, "experiments", id), {
    active,
    updatedAt: serverTimestamp(),
  });
}
