// This file contains functions that will update the various metadata fields of a Document
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

import { ShareStyle } from "@lib/documentTypes";

import { processDocumentUpdate } from "./documentOperations";
import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";

export async function updateDocumentShareStyle(
  documentId: string,
  newShareStyle: ShareStyle,
  writerId: string
) {
  await updateDocumentMetadata(
    documentId,
    "share_link_style",
    newShareStyle,
    writerId
  );
}

export async function updateDocumentEmoji(
  documentId: string,
  newEmoji: string,
  writerId: string
) {
  await updateDocumentMetadata(
    documentId,
    "preview_emoji",
    newEmoji,
    writerId
  );
}

export async function updateDocumentColor(
  documentId: string,
  newColor: string,
  writerId: string
) {
  await updateDocumentMetadata(
    documentId,
    "preview_color",
    newColor,
    writerId
  );
}

// assumption: only share with existing users
export async function shareDocumentWithUser(
  documentId: string,
  userId: string,
  shareStyle: ShareStyle,
  writerId: string
) {
  if (
    await updateDocumentMetadata(
      documentId,
      `share_list.${userId}`,
      shareStyle.valueOf(),
      writerId
    )
  ) {
    await getFirebase().insertUserDocument(userId, documentId, false);
  }
}

export async function unshareDocumentWithUser(
  documentId: string,
  userId: string,
  writerId: string
) {
  if (
    await updateDocumentMetadata(
      documentId,
      `share_list.${userId}`,
      firebase.firestore.FieldValue.delete(),
      writerId
    )
  ) {
    await getFirebase().deleteUserDocument(userId, documentId, false);
  }
}

// TO DO: verify that key passed in to updateDocumentMetadata is valid
// generic version of all the other functions in this file; updates a metadata field for a document
async function updateDocumentMetadata(
  documentId: string,
  key: string,
  newValue: unknown,
  writerId: string
): Promise<boolean> {
  const firebaseKey = `metadata.${key}`;
  return processDocumentUpdate(
    { [firebaseKey]: newValue },
    documentId,
    writerId
  );
}

const getFirebase = (): FirebaseWrapper => {
  const firebase = new FirebaseWrapper();
  firebase.initApp();
  return firebase;
};
