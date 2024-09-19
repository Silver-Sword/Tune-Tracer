import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { getDocument } from "./documentOperations";
import { Document } from '@lib/documentTypes';

// returns all documents created by the user associated with the userId
export async function getDocumentsOwnedByUser(userEmail: string): Promise<Document[]>
{
    return getDocumentsByUser(userEmail, true);
}

// returns all documents shared with the user associated with the userEmail
// this function does not distinguish between view-only shares, comment-able shares, or edit shares
export async function getDocumentsSharedWithUser(userEmail: string): Promise<Document[]>
{
    return getDocumentsByUser(userEmail, false);
}

async function getDocumentsByUser(userEmail: string, isOwned: boolean): Promise<Document[]>
{
    const firebase = new FirebaseWrapper();
    firebase.initApp();
    const documentIdList = await getDocumentIdsByUser(userEmail, isOwned);
    const documentList = [];
    for(const id of documentIdList)
    {
        try {
            const document = await getDocument(id, userEmail);
            if(document === null || document === undefined) {
                continue;
            }
            documentList.push(document);
        } catch(error)
        {
            console.warn(`user ${userEmail} trying to access document ${id} but does not have permissions`);
        }
    }
    return documentList;
}

async function getDocumentIdsByUser(userEmail: string, isOwned: boolean): Promise<string[]>
{
    const firebase = new FirebaseWrapper();
    firebase.initApp();
    return await firebase.getUserDocuments(userEmail, isOwned);
}