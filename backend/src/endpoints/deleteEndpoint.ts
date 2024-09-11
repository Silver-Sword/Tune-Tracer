import { deleteDocument } from '../document-utils/documentOperations';
import { Document } from '../document-utils/documentTypes';

export async function deleteWorkspace(document: Document)
{
    // check if user is authorized
    try
    {
        await deleteDocument(document);
    }
    catch (error)
    {
        return false;
    }

    return true;
}