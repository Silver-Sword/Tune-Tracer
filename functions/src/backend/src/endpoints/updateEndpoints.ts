import firebase from "firebase/compat/app";
import { Document } from '../../../lib/src/Document';
import { updateDocument } from '../document-utils/documentOperations';
import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";  

export async function updateWorkspace(updatedDocument: Document): Promise<boolean>
{
    const user = await firebase.auth().currentUser;
        
    return await updateDocument(updatedDocument, user?.uid as string);
}

export async function updatePartialDocument(documentId: string, documentObject: Record<string, unknown>): Promise<boolean>
{
    // const user = await firebase.auth().currentUser;
    const firebaseWrapper = new FirebaseWrapper();

    firebaseWrapper.initApp();
        
    return await firebaseWrapper.updatePartialDocument(documentId, documentObject);
}