import { deleteDocument } from '../document-utils/documentOperations';
import { Document } from '@lib/documentTypes';
import firebase from 'firebase/compat/app';

export async function deleteWorkspace(document: Document, userId: string) 
{
    try
    {
        const user = await firebase.auth().currentUser;
        await deleteDocument(document, user?.uid as string);
    }
    catch (error)
    {
        throw new Error(`Failed to delete workspace: ${error}`);
    }
}