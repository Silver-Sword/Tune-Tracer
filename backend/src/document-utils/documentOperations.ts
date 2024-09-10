import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { Document, DocumentMetadata, SHARE_STYLE } from './documentTypes'; 

// takes in the user id who triggered the document creation and returns a
// promise containing a default (blank) document as a Document
export async function createDocument(creatorId: string): Promise<Document>
{
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    firebase.initApp();
    const documentId = await firebase.createDocument();

    const currentTime = Date.now();
    const metadata: DocumentMetadata = {
        document_id: documentId,
        owner_email: creatorId,
        share_style: SHARE_STYLE.private_document,
        time_created: currentTime,
        last_edit_time: currentTime,
        last_edit_user: creatorId,
    };
    const document : Document = {
        document_title: "",
        contents: JSON.parse(JSON.stringify("{}")),
        comments: [],
        metadata: metadata
    };

    await firebase.updateDocument(documentId, document);
    await firebase.insertUserDocument(creatorId, documentId, true);
    return document;
}

// takes in the updated documet and returns a promise containing true iff the document was
// successfully updated
// assumes the writing user has already been authenticated
// ONLY UPDATE THE DOCUMENT CONTENT USING THIS FUNCTION (metadata should be updated in a different function)
export async function updateDocument(updatedDocument: Document): Promise<boolean>
{
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    firebase.initApp();

    const documentId = updatedDocument.metadata.document_id;
    return firebase.updateDocument(documentId, updatedDocument);
}

// returns a promise containing the Document associated with the documentId
// assumes proper access has already been verified
// throws an error if document retrieval failed
export async function getDocument(documentId: string): Promise<Document>
{
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    firebase.initApp();

    const firebaseDocument = await firebase.getDocument(documentId);
    if(firebaseDocument === null)
    {
        throw Error(`Error retrieving firebase document ${documentId}. Make sure the document associated with the id and the internet connection is good.`)
    }

    return firebaseDocument;
}

// deletes the document associated with the given document id
// assumes the user owns the document
export async function deleteDocument(document: Document): Promise<void>
{
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    firebase.initApp();

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