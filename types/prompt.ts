import type { Timestamp } from "firebase/firestore";
import type { Batch } from "./user";

export type PromptAuthorType = "faculty" | "system" | "student_weekly_architect";

export type PromptStatus = "scheduled" | "open" | "closed";

export interface Prompt {
  /** "yyyy-MM-dd" */
  date: string;
  dayOfWeek: string;
  semesterId: string;
  batch: Batch;
  conceptA: string;
  conceptB: string;
  subjectTag: string;
  status: PromptStatus;
  authorType: PromptAuthorType;
  createdByUserId: string;
  opensAt: Timestamp;
  closesAt: Timestamp;
}
