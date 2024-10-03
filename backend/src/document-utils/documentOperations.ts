import { Document, DocumentMetadata, DocumentPreview, ShareStyle } from '@lib/src/documentTypes';

import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { userHasReadAccess, userHasWriteAccess } from '../security-utils/permissionVerification';
import { recordOnlineUserUpdatedDocument } from "./realtimeOnlineUsers";
import { getDefaultCompositionData } from '@lib/src/CompToolData';

// NOTE: UPDATE functions MODIFY the document that is passed to it

// takes in the user id who triggered the document creation and returns a
// promise containing a default (blank) document as a Document
export async function createDocument(writerId: string): Promise<Document>
{
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    firebase.initApp();
    const documentId = await firebase.createDocument();

    const currentTime = Date.now();
    const metadata: DocumentMetadata = {
        document_id: documentId,
        owner_id: writerId,
        share_link_style: ShareStyle.NONE,
        time_created: currentTime,
        last_edit_time: currentTime,
        last_edit_user: writerId,
        is_favorited: false,
        share_list: {},
    };
    const document : Document = {
        document_title: "",
        composition: getDefaultCompositionData(),
        comments: [],
        metadata: metadata
    };

    await firebase.updateDocument(documentId, document);
    await firebase.insertUserDocument(writerId, documentId, "owned");
    return document;
}

// DANGEROUS: DO NOT CALL THIS FUNCTION if you don't know what you're doing
// processes a document update request
export async function processDocumentUpdate(
    documentObject: Record<string, unknown>, 
    documentId: string, 
    writerId: string
): Promise<boolean> {
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    firebase.initApp();

    // check that the document exists and the user can write to it
    const initialDocument = await firebase.getDocument(documentId);
    if(initialDocument === null) {
        throw Error(`Trying to update document ${documentId}, which doesn't exist in Firestore`);
    } else if(!userHasWriteAccess(writerId, initialDocument)) {
        throw Error(`User ${writerId} is trying to update document ${documentId}, but doesn't have the permissions to do so`);
    }

    // update the fields that are edited during a write
    if('metadata' in documentObject)
    {
        (documentObject['metadata'] as any)['last_edit_time'] = Date.now();
        (documentObject['metadata'] as any)['last_edit_user'] = writerId;
    } else
    {
        documentObject['metadata.last_edit_time'] = Date.now();
        documentObject['metadata.last_edit_user'] = writerId;
    }

    // update partial document
    await recordOnlineUserUpdatedDocument(documentId, {user_id: writerId});
    return firebase.updatePartialDocument(documentId, documentObject);
}

// takes in the updated document and the id of the user making the edit(s)
// returns a promise containing true iff the document was successfully updated
// ONLY UPDATE THE DOCUMENT CONTENT USING THIS FUNCTION (metadata should be updated in a different function)
export async function updateDocument(updatedDocument: Document, writerId: string): Promise<boolean>
{
    return processDocumentUpdate(updatedDocument, updatedDocument.metadata.document_id, writerId);
}

// DO NOT DIRECTLY CALL THIS FUNCTION IN THE APIs
// returns a promise containing the Document associated with the documentId
// throws an error if document retrieval failed or if the user lacks appropriate permissions
// readerId is the user id of the user attempting to get the document
export async function getDocument(documentId: string, readerId: string): Promise<Document>
{
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    firebase.initApp();

    const firebaseDocument = await firebase.getDocument(documentId);
    if(firebaseDocument === null)
    {
        throw Error(`Error retrieving firebase document ${documentId}. Make sure the document associated with the id and the internet connection is good.`)
    }
        
    if(!userHasReadAccess(readerId, firebaseDocument))
    {
        throw Error(`User with id ${readerId} does not have read access to document with id ${documentId}`);
    } else if(
        readerId !== firebaseDocument.metadata.owner_id && 
        !Object.keys(firebaseDocument.metadata.share_list).includes(readerId)
    ) {
        await firebase.insertUserDocument(readerId, firebaseDocument.metadata.document_id, "accessed");
    }
    return firebaseDocument;
}

// gets a Document and extracts and returns its DocumentPreview
export async function getDocumentPreview(documentId: string, readerId: string): Promise<DocumentPreview>
{
    const document = await getDocument(documentId, readerId);
    return {
        ...document.metadata, 
        ...{document_title: document.document_title}
    };
}

// deletes the document associated with the given document id
// will only delete the document if it exists and the user that is attempting the delete is the creator
// writerId is the user id of the user doing the deletion
export async function deleteDocument(document: Document, writerId: string): Promise<void>
{
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    firebase.initApp();

    if(writerId !== document.metadata.owner_id)
    {
        throw Error(`User ${writerId} is trying to delete document ${document.metadata.document_id}, which is owned by another user`);
    }

    const documentId = document.metadata.document_id;
    const userId = document.metadata.owner_id;

    await firebase.deleteDocument(documentId);
    
    // delete the document from the user owned documents
    await firebase.deleteUserDocument(userId, documentId, "owned");

    // delete the document from the user shared documents
    for(const sharedUser of Object.keys(document.metadata.share_list))
    {
        await firebase.deleteUserDocument(sharedUser, documentId, "shared");
    }
}

// determines if a document exist in the Firestore database by attempting to retrieve it
// returns a promise containing true iff the document exists in a valid storage format
export async function doesDocumentExist(documentId: string): Promise<boolean>
{
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    firebase.initApp();
    return (await firebase.doesDocumentExist(documentId));
}