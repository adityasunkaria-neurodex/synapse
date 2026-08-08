import type { Timestamp, FieldValue } from "firebase/firestore";

/**
 * Batches are admission-year cohorts (e.g. "2023-27"). There's no existing
 * lib/auth.ts to inherit this list from, so this is a starting assumption —
 * adjust BATCH_OPTIONS to match your program's actual batch names before
 * building the signup/complete-profile forms in Prompt 2.
 */
export const BATCH_OPTIONS = ["2023-27", "2024-28", "2025-29", "2026-30"] as const;
export type Batch = (typeof BATCH_OPTIONS)[number];

export interface SynapseUser {
  uid: string;
  /** Locked at signup — never editable after account creation. */
  displayName: string;
  batch: Batch;
  /** The ONLY field a user may update on their own doc post-signup. */
  currentSemester: string;
  avatarEmoji: string;
  joinedAt: Timestamp;
}

/**
 * Fields to spread onto a new users/{uid} doc at signup completion, before
 * merging in the user-provided displayName/batch/avatarEmoji/uid.
 * joinedAt uses FieldValue (serverTimestamp()) at write time, which is why
 * the type here is broader than SynapseUser.joinedAt's plain Timestamp.
 */
export const DEFAULT_NEW_USER_FIELDS: { currentSemester: string } = {
  currentSemester: "Semester 1",
};

export type NewSynapseUserWrite = Omit<SynapseUser, "joinedAt"> & {
  joinedAt: FieldValue;
};
