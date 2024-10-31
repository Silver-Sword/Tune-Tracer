import { getDocumentPreviewsOwnedByUser, getDocumentPreviewsSharedWithUser } from '../document-utils/documentBatchRead';
import { DocumentPreview } from '../lib/src/documentProperties';

export async function getAllDocuments (userId: string) : Promise<DocumentPreview[]>
{
    try
    {
        const ownedPreviews = await getUserDocuments(userId);
        const sharedPreviews = await getSharedDocuments(userId);
        const docPreviews = [...ownedPreviews, ...sharedPreviews];
        return docPreviews;
    }
    catch (error)
    {
        throw Error("Get all documents preview error");
    }
}

export async function getUserDocuments (userId: string) : Promise<DocumentPreview[]>
{
    const ownedPreviews = await getDocumentPreviewsOwnedByUser(userId);
    return ownedPreviews;
}

export async function getSharedDocuments (userId: string) : Promise<DocumentPreview[]>
{
    const ownedPreviews = await getDocumentPreviewsSharedWithUser(userId);
    return ownedPreviews;
}