import { getFirebase } from "../firebase-utils/FirebaseWrapper";

// returns the user id from the email
// throws an error if the email is not in the database
export async function getUserIdFromEmail(userEmail: string): Promise<string> {
    const id = await getFirebase().getUserIdFromEmail(userEmail);
    if(id === null) {
        throw Error(`Trying to get id for user ${userEmail}, but could not find user in database`);
    }
    return id;
}