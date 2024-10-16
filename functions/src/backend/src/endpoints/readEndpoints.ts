// import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { getDocumentPreviewsOwnedByUser, getDocumentPreviewsSharedWithUser } from '../document-utils/documentBatchRead';
import { getDocument } from '../document-utils/documentOperations';
import { Document} from '../../../lib/src/Document'
import { DocumentPreview } from '../../../lib/src/documentProperties';
import { UpdateType,OnlineEntity } from '../../../lib/src/realtimeUserTypes';
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
    // const user = await firebase.auth().currentUser;
    // const userID = user?.uid;
    const ownedPreviews = await getDocumentPreviewsOwnedByUser(userId);
    return ownedPreviews;
}

export async function getSharedDocuments (userId: string) : Promise<DocumentPreview[]>
{
    // const user = await firebase.auth().currentUser;
    // const userID = user?.uid;
    const ownedPreviews = await getDocumentPreviewsSharedWithUser(userId as string);
    return ownedPreviews;
}