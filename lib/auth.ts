import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  getAdditionalUserInfo,
  updateProfile,
  type User,
  type UserCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import { DEFAULT_NEW_USER_FIELDS, type Batch, type SynapseUser } from "@/types/user";

export interface NewProfileInput {
  displayName: string;
  batch: Batch;
  avatarEmoji: string;
  currentSemester?: string;
}

/**
 * Email/password signup: creates the Auth user AND the users/{uid} Firestore
 * doc in one call, since (unlike Google) we collect the full profile on the
 * same form.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  profile: NewProfileInput
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: profile.displayName });
  await createUserDoc(credential.user.uid, profile);
  return credential.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/**
 * Google popup sign-in. Returns both the user and whether this is their
 * first-ever sign-in (via getAdditionalUserInfo), so the caller can route
 * brand-new users to /complete-profile before a users/{uid} doc exists.
 */
export async function signInWithGooglePopup(): Promise<{ user: User; isNewUser: boolean }> {
  const credential: UserCredential = await signInWithPopup(auth, googleProvider);
  const additionalInfo = getAdditionalUserInfo(credential);
  return { user: credential.user, isNewUser: Boolean(additionalInfo?.isNewUser) };
}

/**
 * Called from /complete-profile after a brand-new Google sign-in, once the
 * user has supplied batch/currentSemester/avatarEmoji. displayName defaults
 * to whatever Google supplied unless the user overrides it here (still
 * "locked" thereafter, per schema).
 */
export async function completeGoogleProfile(
  uid: string,
  profile: NewProfileInput
): Promise<void> {
  await createUserDoc(uid, profile);
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/** The ONLY field a signed-in user may update on their own users/{uid} doc. */
export async function updateCurrentSemester(uid: string, currentSemester: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { currentSemester });
}

export async function fetchUserDoc(uid: string): Promise<SynapseUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as SynapseUser) : null;
}

async function createUserDoc(uid: string, profile: NewProfileInput): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    uid,
    displayName: profile.displayName,
    batch: profile.batch,
    avatarEmoji: profile.avatarEmoji,
    currentSemester: profile.currentSemester ?? DEFAULT_NEW_USER_FIELDS.currentSemester,
    joinedAt: serverTimestamp(),
  });
}

/** Maps Firebase Auth error codes to short, user-facing messages. */
export function friendlyAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/email-already-in-use":
      return "That email is already registered. Try signing in instead.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
