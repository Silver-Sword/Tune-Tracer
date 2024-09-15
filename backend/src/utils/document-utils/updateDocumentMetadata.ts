import { Document, DocumentMetadata, SHARE_STYLE } from "@lib/documentTypes";
import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";

import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore';

// TO DO: verify that key passed in to updateDocumentMetadata is valid

const getFirebase = (): FirebaseWrapper => {
    const firebase = new FirebaseWrapper();
    firebase.initApp();
    return firebase;
};

// generic version of all following functions; updates a metadata field for a document
async function updateDocumentMetadata(documentId: string, key: string, newValue: unknown) {
    const firebase = getFirebase();
    const firebaseKey = `metadata.${key}`;
    await firebase.updateDocumentMetadataField(documentId, {[firebaseKey]: newValue});
}

export async function updateDocumentShareStyle(documentId: string, newShareStyle: SHARE_STYLE) {
    await updateDocumentMetadata(documentId, 'share_style', newShareStyle);
}

export async function updateDocumentEmoji(documentId: string, newEmoji: string) {
    await updateDocumentMetadata(documentId, 'preview_emoji', newEmoji);
}

export async function updateDocumentColor(documentId: string, newColor: string) {
    await updateDocumentMetadata(documentId, 'preview_color', newColor);
}

// assumption: only call this function if the user is not already in the share list
// assumption: only share with existing users
export async function shareDocumentWithUser(documentId: string, newUser: string) {
    await Promise.all([
            updateDocumentMetadata(documentId, 'share_list', firebase.firestore.FieldValue.arrayUnion(newUser)),
            getFirebase().insertUserDocument(newUser, documentId, false)
        ]);
}

export async function unshareDocumentWithUser(documentId: string, oldUser: string) {
    await Promise.all([
            updateDocumentMetadata(documentId, 'share_list', firebase.firestore.FieldValue.arrayRemove(oldUser)),
            getFirebase().deleteUserDocument(oldUser, documentId, false)
        ]);
}