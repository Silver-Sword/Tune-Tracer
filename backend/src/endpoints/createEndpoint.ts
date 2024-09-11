import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import firebase from 'firebase/compat/app';
import { createDocument } from '../document-utils/documentOperations';
import { readWorkspace } from './readEndpoints'
import { Document } from '../document-utils/documentTypes';

// returns new document (not just id)
export async function createWorkspace () : Promise<Document | null>
{
    const user = firebase.auth().currentUser;
    if (!user)
    {
        console.log("Failed to identify user");
        return null;
    }
    return await createDocument(user.uid);
}   