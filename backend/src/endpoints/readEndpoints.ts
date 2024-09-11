import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { getDocumentsOwnedByUser, getDocumentsSharedWithUser } from '../document-utils/documentBatchRead';
import { Document } from '../document-utils/documentTypes';
import firebase from 'firebase/compat/app';

export async function readWorkspace (documentId: string) : Promise<Document | null>
{
    const firebaseWrapper = new FirebaseWrapper();
    firebaseWrapper.initApp();

    // const user = firebase.auth().currentUser;
    // userHasReadAccess import here (or equivalent)
    const document = await firebaseWrapper.getDocument(documentId);
    
    return document;
}

export async function getAllDocuments (userId: string) : Promise<Document[]>
{
    const firebaseWrapper = new FirebaseWrapper();
    firebaseWrapper.initApp();

    try 
    {
        const userDocuments = await getUserDocuments( userId, firebaseWrapper);
        const sharedDocuments = await getSharedDocuments( userId, firebaseWrapper);
        const documents = [...userDocuments, ...sharedDocuments];
        return documents;
    }
    catch (error)
    {
        console.log("Could not read documents");
    }

    return [];
}

export async function getUserDocuments (userId: string, firebase: FirebaseWrapper) : Promise<Document[]>
{
    return getDocumentsOwnedByUser(userId);
}

export async function getSharedDocuments (userId: string, firebase: FirebaseWrapper) : Promise<Document[]>
{
    return getDocumentsSharedWithUser(userId);
}