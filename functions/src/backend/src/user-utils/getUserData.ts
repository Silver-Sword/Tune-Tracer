import { getFirebase } from "../firebase-utils/FirebaseWrapper";

// returns the user id from the email (or null if the user does not exist)
export async function getUserIdFromEmail(userEmail: string): Promise<string | null> {
    const id = await getFirebase().getUserIdFromEmail(userEmail);
    return id;
}

// returns non-sensitive user data given the user id
// returns null if the user does not exist
export async function getUserFromId(userId: string) {
    const userEntity = await getFirebase().getUser(userId);
    if(userEntity === null) {
        return null;
    }
    return {
        user_id: userEntity.user_id,
        user_email: userEntity.user_email,
        display_name: userEntity.display_name,
        account_creation_time: userEntity.account_creation_time,
    };
}