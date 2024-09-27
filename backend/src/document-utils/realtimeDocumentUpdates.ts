import { Document } from "@lib/documentTypes";
import { OnlineEntity, UpdateType } from "@lib/realtimeUserTypes";
import { UserEntity } from "@lib/userTypes";

import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { subscribeUserToUserDocumentPool } from "./realtimeOnlineUsers";

/**
 * Subscribes the user to a document. Adds the user to the user pool and calls the onDocumentUpdateFn and onUserPoolUpdateFn
 * whenever updates occur.  Both callback functions will be triggered on first call to the subscribeToDocument function will
 * the initial information.
 * @param documentId the id of the document that the user is subscribing to
 * @param user the user account information (the user_id, user_email, and display_name fields are required, others are optional)
 * @param onDocumentUpdateFn the callback function that is called everytime the document is updated (locally or remotely).
 *  updatedDocument is the document that has been updated. 
 *  Race conditions possible, make sure to verify that the updated version is newer.
 * @param onUserPoolUpdateFn the callback function that is called everytime the user pool is updated (locally or remotely).
 *  Is called on the type of update and the updated OnlineEntity. Race conditions possible, make sure last_active_time is more recent
 */
export async function subscribeToDocument(
  documentId: string,
  user: Record<string, unknown> & Required<Pick<UserEntity, 'user_id' | 'user_email' | 'display_name'>>,
  onDocumentUpdateFn: (updatedDocument: Document) => void,
  onUserPoolUpdateFn: (updateType: UpdateType, updatedUser: OnlineEntity) => void,
) {
  const firebase = new FirebaseWrapper();
  firebase.initApp();

  await subscribeUserToUserDocumentPool(documentId, user, onUserPoolUpdateFn);

  firebase.subscribeToDocument(documentId, (snapshot) => {
    if (
      snapshot.exists &&
      snapshot.data() !== null &&
      snapshot.data() !== undefined
    ) {
      onDocumentUpdateFn(snapshot.data() as Document);
    }
  });
}