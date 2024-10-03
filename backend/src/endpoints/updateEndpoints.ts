import firebase from "firebase/compat/app";
import { Document } from '@lib/documentTypes';
import { updateDocument } from '../document-utils/documentOperations';

export async function updateWorkspace(updatedDocument: Document): Promise<boolean>
{
    const user = await firebase.auth().currentUser;
        
    return await updateDocument(updatedDocument, user?.uid as string);
}