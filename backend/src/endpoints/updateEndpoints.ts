import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { Document } from '../document-utils/documentTypes';
import { updateDocument } from '../document-utils/documentOperations';

export async function updateWorkspace(updatedDocument: Document): Promise<boolean>
{
    return await updateDocument(updatedDocument);
}