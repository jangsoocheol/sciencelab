export function formatTimestamp(timestamp: unknown): string {
  if (!timestamp) return "-";

  try {
    const ts = timestamp as any;

    // Firestore Timestamp object
    if (ts._seconds !== undefined) {
      return new Date(ts._seconds * 1000).toLocaleString("ko-KR");
    }

    // Regular timestamp number
    if (typeof ts === "number") {
      return new Date(ts).toLocaleString("ko-KR");
    }

    // Date object
    if (ts instanceof Date) {
      return ts.toLocaleString("ko-KR");
    }

    return "-";
  } catch {
    return "-";
  }
}
