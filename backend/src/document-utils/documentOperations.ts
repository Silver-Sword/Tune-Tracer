import { dataToDocument, documentToData } from "../firebase-utils/documentConversionUtils";
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
    };
    const document : Document = {
        document_title: "",
        contents: JSON.parse(JSON.stringify("{}")),
        comments: [],
        metadata: metadata
    };

    await firebase.updateDocument(documentId, documentToData(document));
    return document;
}

// takes in the updated documet and returns a promise containing true iff the document was
// successfully updated
// assumes the writing user has already been authenticated
export async function updateDocument(updatedDocument: Document): Promise<boolean>
{
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    firebase.initApp();

    const documentId = updatedDocument.metadata.document_id;
    return firebase.updateDocument(documentId, documentToData(updatedDocument));
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

    const document = dataToDocument(firebaseDocument);
    return document;
}

// deletes the document associated with the given document id
// assumes the user owns the document
export async function deleteDocument(documentId: string): Promise<void>
{
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    firebase.initApp();

    await firebase.deleteDocument(documentId);
}