import type { Timestamp } from "firebase/firestore";
import type { Batch } from "./user";

/**
 * Lives at prompts/{promptId}/responses/{userId} — a subcollection, 4 path
 * segments, a valid Firestore document path. The old project's
 * responses/{promptId}/{userId} (3 segments) could never resolve to a real
 * document; this shape fixes that.
 */
export interface PromptResponse {
  text: string;
  /** Set via serverTimestamp() on create. */
  submittedAt: Timestamp;
  semesterId: string;
  batch: Batch;
  coherenceMark: number | null;
  noveltyMark: number | null;
  teacherNote: string | null;
  voteCount: number;
  isDailyWinner: boolean;
}
