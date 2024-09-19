import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { Document, DocumentMetadata, SHARE_STYLE } from '@lib/documentTypes'; 
import { userHasReadAccess, userHasWriteAccess } from '../security-utils/permissionVerification';

// NOTE: UPDATE MODIFIES the document that is passed to it

// takes in the user id who triggered the document creation and returns a
// promise containing a default (blank) document as a Document
export async function createDocument(writerEmail: string): Promise<Document>
{
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    firebase.initApp();
    const documentId = await firebase.createDocument();

    const currentTime = Date.now();
    const metadata: DocumentMetadata = {
        document_id: documentId,
        owner_email: writerEmail,
        share_style: SHARE_STYLE.private_document,
        time_created: currentTime,
        last_edit_time: currentTime,
        last_edit_user: writerEmail,
    };
    const document : Document = {
        document_title: "",
        contents: JSON.parse(JSON.stringify("{}")),
        comments: [],
        metadata: metadata
    };

    await firebase.updateDocument(documentId, document);
    await firebase.insertUserDocument(writerEmail, documentId, true);
    return document;
}

// DO NOT CALL THIS FUNCTION
// processes a document update request
export async function processDocumentUpdate(
    documentObject: Record<string, unknown>, 
    documentId: string, 
    writerEmail: string
): Promise<boolean> {
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    firebase.initApp();

    // check that the document exists and the user can write to it
    const initialDocument = await firebase.getDocument(documentId);
    if(initialDocument === null) {
        throw Error(`Trying to update document ${documentId}, which doesn't exist in Firestore`);
    } else if(!userHasWriteAccess(writerEmail, initialDocument)) {
        throw Error(`User ${writerEmail} is trying to update document ${documentId}, but doesn't have the permissions to do so`);
    }

    // update the fields that are edited during a write
    if('metadata' in documentObject)
    {
        (documentObject['metadata'] as any)['last_edit_time'] = Date.now();
        (documentObject['metadata'] as any)['last_edit_user'] = writerEmail;
    } else
    {
        documentObject['metadata.last_edit_time'] = Date.now();
        documentObject['metadata.last_edit_user'] = writerEmail;
    }

    // update partial document
    return firebase.updatePartialDocument(documentId, documentObject);
}

// takes in the updated document and the email of the user making the edit(s)
// returns a promise containing true iff the document was successfully updated
// ONLY UPDATE THE DOCUMENT CONTENT USING THIS FUNCTION (metadata should be updated in a different function)
export async function updateDocument(updatedDocument: Document, writerEmail: string): Promise<boolean>
{
    return processDocumentUpdate(updatedDocument, updatedDocument.metadata.document_id, writerEmail);
}

// returns a promise containing the Document associated with the documentId
// throws an error if document retrieval failed or if the user lacks appropriate permissions
// readerEmail is the email of the user attempting to get the document
export async function getDocument(documentId: string, readerEmail: string): Promise<Document>
{
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    firebase.initApp();

    const firebaseDocument = await firebase.getDocument(documentId);
    if(firebaseDocument === null)
    {
        throw Error(`Error retrieving firebase document ${documentId}. Make sure the document associated with the id and the internet connection is good.`)
    }
        
    if(!userHasReadAccess(readerEmail, firebaseDocument))
    {
        throw Error(`User with email ${readerEmail} does not have read access to document with id ${documentId}`);
    }
    return firebaseDocument;
}

// deletes the document associated with the given document id
// will only delete the document if it exists and the user that is attempting the delete is the creator
// writerEmail is the email of the user doing the deletion
export async function deleteDocument(document: Document, writerEmail: string): Promise<void>
{
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    firebase.initApp();

    if(writerEmail !== document.metadata.owner_email)
    {
        throw Error(`User ${writerEmail} is trying to delete document ${document.metadata.document_id}, which is owned by another user`);
    }

    const documentId = document.metadata.document_id;
    const userId = document.metadata.owner_email;

    await firebase.deleteDocument(documentId);
    
    // delete the document from the user owned documents
    await firebase.deleteUserDocument(userId, documentId, true);

    // delete the document from the user shared documents
    for(const sharedUser of (document.metadata.share_list ?? []))
    {
        await firebase.deleteUserDocument(sharedUser, documentId, false);
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