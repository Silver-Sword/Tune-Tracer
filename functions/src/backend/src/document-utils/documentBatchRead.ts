import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { getDocument } from "./documentOperations";
import { Document } from './documentTypes';

// returns all documents created by the user associated with the userId
export async function getDocumentsOwnedByUser(userId: string): Promise<Document[]>
{
    return getDocumentsByUser(userId, true);
}

// returns all documents shared with the user associated with the userId
// this function does not distinguish between view-only shares, comment-able shares, or edit shares
export async function getDocumentsSharedWithUser(userId: string): Promise<Document[]>
{
    return getDocumentsByUser(userId, false);
}

async function getDocumentsByUser(userId: string, isOwned: boolean): Promise<Document[]>
{
    const firebase = new FirebaseWrapper();
    firebase.initApp();
    const documentIdList = await getDocumentIdsByUser(userId, isOwned);
    const documentList : Document[] = [];
    for(const id of documentIdList)
    {
        var document = await getDocument(id);
        documentList.push(document);
    }
    return documentList;
}

async function getDocumentIdsByUser(userId: string, isOwned: boolean): Promise<string[]>
{
    const firebase = new FirebaseWrapper();
    firebase.initApp();
    return await firebase.getUserDocuments(userId, isOwned);
}