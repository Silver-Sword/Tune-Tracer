import { SHARE_STYLE } from "@lib/documentTypes";
import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";

import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore';
import { processDocumentUpdate } from "./documentOperations";

const getFirebase = (): FirebaseWrapper => {
    const firebase = new FirebaseWrapper();
    firebase.initApp();
    return firebase;
};

// TO DO: verify that key passed in to updateDocumentMetadata is valid
// generic version of all following functions; updates a metadata field for a document
async function updateDocumentMetadata(
    documentId: string, 
    key: string, 
    newValue: unknown, 
    writerEmail: string
): Promise<boolean> {
    const firebaseKey = `metadata.${key}`;
    return processDocumentUpdate({[firebaseKey]: newValue}, documentId, writerEmail);
}

export async function updateDocumentShareStyle(
    documentId: string, 
    newShareStyle: SHARE_STYLE, 
    writerEmail: string
) {
    await updateDocumentMetadata(documentId, 'share_style', newShareStyle, writerEmail);
}

export async function updateDocumentEmoji(
    documentId: string, 
    newEmoji: string, 
    writerEmail: string
) {
    await updateDocumentMetadata(documentId, 'preview_emoji', newEmoji, writerEmail);
}

export async function updateDocumentColor(
    documentId: string, 
    newColor: string, 
    writerEmail: string
) {
    await updateDocumentMetadata(documentId, 'preview_color', newColor, writerEmail);
}

// assumption: only call this function if the user is not already in the share list
// assumption: only share with existing users
export async function shareDocumentWithUser(
    documentId: string, 
    newUser: string, 
    writerEmail: string
) {
    if(await updateDocumentMetadata(
        documentId, 
        'share_list', 
        firebase.firestore.FieldValue.arrayUnion(newUser),
        writerEmail)
    ){
        await getFirebase().insertUserDocument(newUser, documentId, false)
    }
}

export async function unshareDocumentWithUser(
    documentId: string, 
    oldUser: string, 
    writerEmail: string
) {
    if(await updateDocumentMetadata(
        documentId, 
        'share_list', 
        firebase.firestore.FieldValue.arrayRemove(oldUser), 
        writerEmail)
    ) {
            await getFirebase().deleteUserDocument(oldUser, documentId, false)
    }
}