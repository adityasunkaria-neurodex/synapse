# Synapse — Firestore Schema (source of truth)

This is the authoritative schema for the whole project. Every prompt after
Prompt 1 must match this exactly — path shapes, field names, and types.
If a later change needs a different schema, update this file in the same
change. Never let the code and this doc drift apart.

## Collections and exact paths

### `users/{userId}`

One doc per authenticated user. `{userId}` is the Firebase Auth UID.

| Field | Type | Notes |
|---|---|---|
| `uid` | string | matches doc ID |
| `displayName` | string | set at signup, never editable after |
| `batch` | string | admission cohort, e.g. `"2023-27"` |
| `currentSemester` | string | **the only field a user can edit on their own doc** |
| `avatarEmoji` | string | |
| `joinedAt` | Timestamp | set via `serverTimestamp()` at signup |

### `prompts/{promptId}`

One doc per daily prompt. `{promptId}` is an auto-generated Firestore ID.

| Field | Type | Notes |
|---|---|---|
| `date` | string | `"yyyy-MM-dd"` |
| `dayOfWeek` | string | derived from `date` |
| `semesterId` | string | |
| `batch` | string | which batch this prompt is for |
| `conceptA` | string | |
| `conceptB` | string | |
| `subjectTag` | string | |
| `status` | string | `"scheduled" \| "open" \| "closed"` |
| `authorType` | string | `"faculty" \| "system" \| "student_weekly_architect"` |
| `createdByUserId` | string | |
| `opensAt` | Timestamp | |
| `closesAt` | Timestamp | |

### `prompts/{promptId}/responses/{userId}` — SUBCOLLECTION

**This is the fix for the old bug.** `{userId}` is the responding student's
UID, so at most one response per student per prompt. The full path is
`prompts/{promptId}/responses/{userId}` — 4 segments
(`collection/doc/collection/doc`), which is a valid, even-segment Firestore
document path. It always resolves.

The old schema used `responses/{promptId}/{userId}` — a 3-segment path,
which alternates `collection/doc/collection` and therefore points at a
**collection**, not a document. Any attempt to `getDoc()` that path silently
failed. Do not reintroduce this shape.

| Field | Type | Notes |
|---|---|---|
| `text` | string | the student's response |
| `submittedAt` | Timestamp | set via `serverTimestamp()` on create |
| `semesterId` | string | denormalized from the parent prompt |
| `batch` | string | denormalized from the parent prompt |
| `coherenceMark` | number \| null | null until graded; admin-only after create |
| `noveltyMark` | number \| null | null until graded; admin-only after create |
| `teacherNote` | string \| null | admin-only after create |
| `voteCount` | number | starts at 0 |
| `isDailyWinner` | boolean | starts `false`; at most one `true` per prompt |

### `pendingPrompts/{promptId}`

Student-authored ("weekly architect") prompt drafts awaiting approval.
`{promptId}` is an auto-generated Firestore ID (different from the ID it
gets once copied into `prompts/` on approval).

| Field | Type | Notes |
|---|---|---|
| `authorUserId` | string | the drafting student's UID |
| `approved` | boolean | starts `false`; only admin may flip this |
| `conceptA`, `conceptB`, `subjectTag`, etc. | — | same draft fields as `prompts/`, minus the ones admin fills in on approval (`authorType`, `createdByUserId`, `opensAt`/`closesAt`, `status`) |

On approval, the admin copies the doc's data into a new
`prompts/{promptId}` doc with `authorType: "student_weekly_architect"` and
`createdByUserId` set to the original `authorUserId`. The `pendingPrompts`
doc itself is left in place (rules currently allow admin delete if you want
to clean these up later).

## Access rules summary (see `firestore.rules` for exact logic)

- **`users`** — read: self or admin. create: self only. update: self may
  only touch `currentSemester`; admin may touch anything. delete: never.
- **`prompts`** — read: admin, or any signed-in user whose own `batch`
  matches the prompt's `batch`. write (create/update/delete): admin only.
- **`prompts/{promptId}/responses/{userId}`** — read: admin or the owning
  student. create: the student themself, only before `closesAt`, only with
  `coherenceMark`/`noveltyMark` set to `null`. update: admin may only touch
  `coherenceMark`/`noveltyMark`/`teacherNote`; the student may edit anything
  else (e.g. `text`) before `closesAt`, but can never touch the three grading
  fields. delete: never.
- **`pendingPrompts`** — read: admin or the drafting author. create: any
  signed-in user, as long as `authorUserId` matches their own UID and
  `approved` starts `false`. update: admin (full access), or the author
  (any field except `authorUserId`/`approved`). delete: admin only.
  **This section is an assumption** — there was no prior `firestore.rules`
  file to copy exact author-edit behavior from. Revisit before relying on it
  in production.

## Admin UID

Hardcoded in `firestore.rules` → `isAdmin()`:
`DIJPamdhyyeraXyDhZuI2WUZ5CZ2`

To change it, edit that one string in `firestore.rules` and redeploy
(`firebase deploy --only firestore:rules`).
