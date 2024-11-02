import { OnlineEntity } from "../lib/src/realtimeUserTypes";
import { UpdateType } from "../lib/src/UpdateType";
import { Document } from "../lib/src/Document";

import { subscribeToDocument } from "./document-utils/realtimeDocumentUpdates";
import { updateUserCursor } from "./document-utils/realtimeOnlineUsers";
import { updatePartialDocument } from "./document-utils/documentOperations";
import { ScoreData } from "../lib/src/ScoreData";

export async function subscribe(
  documentId: string | undefined,
  user: {
    user_id: string | undefined;
    user_email: string | undefined;
    display_name: string | undefined;
  },
  onDocumentUpdateFn: (updatedDocument: Document) => void,
  onUserPoolUpdateFn: (
    updateType: UpdateType,
    updatedUser: OnlineEntity
  ) => void
): Promise<void> {
  if (documentId === undefined) {
    console.error("Document ID is undefined; could not subscribe to document");
    return;
  } else if (user.user_id === undefined) {
    console.error("User ID is undefined; could not subscribe to document");
    return;
  } else if (user.user_email === undefined) {
    console.error("User email is undefined; could not subscribe to document");
    return;
  } else if (user.display_name === undefined) {
    console.error("Display name is undefined; could not subscribe to document");
    return;
  }

  await subscribeToDocument(
    documentId,
    user as any,
    onDocumentUpdateFn,
    onUserPoolUpdateFn
  );
}

export async function sendDocumentChanges(
    changesTemp: {
        documentChanges: {
            score: ScoreData;
        };
        documentId: string | undefined;
        writerId: string | undefined;
    }
) {
  if (changesTemp.documentId === undefined) {
    console.error("Document ID is undefined; could not send document changes");
    return;
  } else if (changesTemp.writerId === undefined) {
    console.error("User ID is undefined; could not send document changes");
    return;
  }

  await updatePartialDocument(changesTemp.documentChanges, changesTemp.documentId, changesTemp.writerId);
}

export async function sendUserChanges(
  documentId: string | undefined,
  userId: string | undefined,
  cursor: unknown
) {
  if (documentId === undefined) {
    console.error("Document ID is undefined; could not send user changes");
    return;
  } else if (userId === undefined) {
    console.error("User ID is undefined; could not send user changes");
    return;
  }
  await updateUserCursor(documentId, { user_id: userId, cursor: cursor });
}
