// This file contains functions that will update the various metadata fields of a Document
import { SHARE_STYLE } from "@lib/documentTypes";
import { processDocumentUpdate } from "./documentOperations";
import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

export async function updateDocumentShareStyle(
  documentId: string,
  newShareStyle: SHARE_STYLE,
  writerId: string
) {
  await updateDocumentMetadata(
    documentId,
    "share_style",
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

// assumption: only call this function if the user is not already in the share list
// assumption: only share with existing users
export async function shareDocumentWithUser(
  documentId: string,
  newUser: string,
  writerId: string
) {
  if (
    await updateDocumentMetadata(
      documentId,
      "share_list",
      firebase.firestore.FieldValue.arrayUnion(newUser),
      writerId
    )
  ) {
    await getFirebase().insertUserDocument(newUser, documentId, false);
  }
}

export async function unshareDocumentWithUser(
  documentId: string,
  oldUser: string,
  writerId: string
) {
  if (
    await updateDocumentMetadata(
      documentId,
      "share_list",
      firebase.firestore.FieldValue.arrayRemove(oldUser),
      writerId
    )
  ) {
    await getFirebase().deleteUserDocument(oldUser, documentId, false);
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
