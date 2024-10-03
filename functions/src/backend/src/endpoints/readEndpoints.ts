// import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { getDocumentPreviewsOwnedByUser, getDocumentPreviewsSharedWithUser } from '../document-utils/documentBatchRead';
import { getDocument } from '../document-utils/documentOperations';
import { Document,DocumentPreview } from '../../../lib/documentTypes';
import { UpdateType,OnlineEntity } from '../../../lib/realtimeUserTypes';
import firebase from 'firebase/compat/app';
import { subscribeToDocument } from "../document-utils/realtimeDocumentUpdates";

export async function readDocument (documentId: string) : Promise<Document | null>
{
    const user = await firebase.auth().currentUser;
    const userID = user?.uid;
    let document = await getDocument(documentId, userID as string);

    const user2 = {
        user_email: user?.email as string,
        user_id: user?.uid as string,
        display_name: user?.displayName as string
    };
    
    subscribeToDocument(documentId, user2, 
        (updatedDocument: Document) => {
        console.log(`Detected changes in document ${documentId}`);
        console.log(`Updated Document: ${JSON.stringify(updatedDocument)}`);
        document = updatedDocument;
    }, 
    (updateType: UpdateType, onlineEntity: OnlineEntity) => {
        console.log(`Update type ${updateType} with entity: ${JSON.stringify(onlineEntity)}`);
    });
    return document;
}

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