import { getDocumentPreviewsOwnedByUser, getDocumentPreviewsSharedWithUser } from '../document-utils/documentBatchRead';
import { DocumentPreview } from '../../../lib/src/documentProperties';
import firebase from 'firebase/compat/app';

export async function getAllDocuments () : Promise<DocumentPreview[]>
{
    try
    {
        const ownedPreviews = await getUserDocuments();
        const sharedPreviews = await getSharedDocuments();
        const docPreviews = [...ownedPreviews, ...sharedPreviews];
        return docPreviews;
    }
    catch (error)
    {
        throw Error("Get all documents preview error");
    }
}

export async function getUserDocuments () : Promise<DocumentPreview[]>
{
    const user = await firebase.auth().currentUser;
    const userID = user?.uid;
    const ownedPreviews = await getDocumentPreviewsOwnedByUser(userID as string);
    return ownedPreviews;
}

export async function getSharedDocuments () : Promise<DocumentPreview[]>
{
    const user = await firebase.auth().currentUser;
    const userID = user?.uid;
    const ownedPreviews = await getDocumentPreviewsSharedWithUser(userID as string);
    return ownedPreviews;
}