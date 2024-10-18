import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

import { UserLevelDocumentProperties } from "@lib/src/documentProperties";
import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";

export async function updateDocumentEmoji(
  documentId: string,
  newEmoji: string,
  writerId: string
) {
  await updateUserLevelDocumentProperty(
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
  await updateUserLevelDocumentProperty(
    documentId,
    "preview_color",
    newColor,
    writerId
  );
}

export async function updateDocumentFavoritedStatus(
  documentId: string,
  isFavorited: boolean,
  writerId: string
) {
  await updateUserLevelDocumentProperty(
    documentId,
    "is_favorited",
    isFavorited,
    writerId
  );
}

// generic version of all the other functions in this file; updates a user level property field for a document
async function updateUserLevelDocumentProperty(
    documentId: string,
    property: keyof UserLevelDocumentProperties,
    newValue: unknown,
    userId: string
  ) {
    await getFirebase().updateUserLevelProperty(userId, documentId, property, newValue);
  }
  
const getFirebase = (): FirebaseWrapper => {
    const firebase = new FirebaseWrapper();
    firebase.initApp();
    return firebase;
};
