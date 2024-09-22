import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { getDocumentPreview } from "./documentOperations";
import { DocumentPreview } from '@lib/documentTypes';

// returns all documents created by the user associated with the userEmail
export async function getDocumentPreviewsOwnedByUser(userEmail: string): Promise<DocumentPreview[]>
{
    return getDocumentPreviewsByUser(userEmail, true);
}

// returns all documents shared with the user associated with the userEmail
// this function does not distinguish between view-only shares, comment-able shares, or edit shares
export async function getDocumentPreviewsSharedWithUser(userEmail: string): Promise<DocumentPreview[]>
{
    return getDocumentPreviewsByUser(userEmail, false);
}

// returns a list of DocumentPreviews that the user associated with the userEmail 
// owns (if isOwned is true) or is shared with the user (if isOwned is false)
async function getDocumentPreviewsByUser(userEmail: string, isOwned: boolean): Promise<DocumentPreview[]>
{
    const firebase = new FirebaseWrapper();
    firebase.initApp();
    const documentIdList = await getDocumentIdsByUser(userEmail, isOwned);
    const documentList = [];
    for(const id of documentIdList)
    {
        try {
            const document = await getDocumentPreview(id, userEmail);
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

// returns the list of document ids that is in the user's owned list (if isOwned is true) 
// or shared with list (if isOwned is false)
async function getDocumentIdsByUser(userEmail: string, isOwned: boolean): Promise<string[]>
{
    const firebase = new FirebaseWrapper();
    firebase.initApp();
    return await firebase.getUserDocuments(userEmail, isOwned);
}