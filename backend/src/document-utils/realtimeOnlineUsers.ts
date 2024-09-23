import { OnlineEntity, UserEntity } from "@lib/UserEntity";
import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";

type PartialWithRequired<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;
type PartialWithRequiredAndWithout<T, K extends keyof T, U extends keyof T> = Partial<T> & Required<Omit<Pick<T, K>, U>>;

/**
 * Purpose: tell Firebase that a user is on a document (for realtime tracking of the user).
 * Firebase will automatically unregister the user after disconnection.
 * @param documentId the unique id of the document
 * @param user the user to register to the document. Must contain the listed fields.
 */
export async function registerUserToDocument(
    documentId: string, 
    user: PartialWithRequired<UserEntity, 'user_email' | 'user_id' | 'display_name'>
){
    const firebase = new FirebaseWrapper();
    firebase.initApp();

    // check if document exists (TO DO: remove the need for this check)
    if(!firebase.doesDocumentExist(documentId)) {
        throw Error(
            `Trying to register user ${user.user_email} to nonexistant document ${documentId}`
        );
    }

    await firebase.registerUserToDocument( documentId, {
        user_email: user.user_email, 
        user_id: user.user_id, 
        display_name: user.display_name
    });
}

/**
 * Records an update to the online user. Useful for updating the cursor information or 
 * updating the last time a user was active.
 * @param documentId the unique id associated with the document
 * @param onlineUser the online user that is being updated. This updates the information in the database.
 *      The user_id field must be INCLUDED and the last_active_time field must be EXCLUDED
 */
export async function recordOnlineUserUpdatedDocument(
    documentId: string,
    onlineUser: PartialWithRequiredAndWithout<OnlineEntity, 'user_id', 'last_active_time'>
) {
    const firebase = new FirebaseWrapper();
    firebase.initApp();
    
    // check if document exists (TO DO: remove the need for this check)
    if(!firebase.doesDocumentExist(documentId)) {
        throw Error(
            `Trying to register user ${onlineUser.user_id} to nonexistant document ${documentId}`
        );
    }
    
    // update the online user information in firebase
    await firebase.updateUserInDocument(documentId, onlineUser);
}

/**
 * Records a new cursor placement for a user on a document.
 * @param documentId the unique id of the document that the user is on
 * @param onlineUser a user object containing '
 *      the user id (not email) associated with the email and the current cursor information for the user.
 */
export async function updateUserCursor(
    documentId: string, 
    onlineUser: Required<Pick<OnlineEntity, 'user_id' | 'cursor'>>
) {
    await recordOnlineUserUpdatedDocument(documentId, onlineUser);
}
