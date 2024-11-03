import { getFirebase } from "../firebase-utils/FirebaseWrapper";

// returns the user id from the email (or null if the user does not exist)
export async function getUserIdFromEmail(userEmail: string): Promise<string | null> {
    const id = await getFirebase().getUserIdFromEmail(userEmail);
    return id;
}