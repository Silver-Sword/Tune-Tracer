import { getFirebase } from "../firebase-utils/FirebaseWrapper";

export async function updateUserDisplayName(
  userId: string,
  displayName: string
): Promise<void> {
  const firebase = getFirebase();
  if (!(await firebase.doesUserExist(userId))) {
    throw new Error(`User ${userId} not found in the database`);
  }
  await firebase.updateDisplayName(userId, displayName).catch((error) => {
    throw error;
  });
}
