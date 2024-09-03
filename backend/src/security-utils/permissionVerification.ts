import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { DocumentMetadata, SHARE_STYLE } from "../document-utils/documentTypes";

// returns true iff a user has read access
// takes in the email of a user and the id of the document to check
async function userHasReadAccess(userId: string, documentId: string)
{
    const firebase = new FirebaseWrapper();
    firebase.initApp();

    const metadata: DocumentMetadata | null = await firebase.getDocumentMetadata(documentId);
    if(metadata === null) {
        return false;
    }

    if(metadata.owner_email === userId || metadata.share_style === SHARE_STYLE.public_document)
    {
        return true;
    } else if(metadata.share_style === SHARE_STYLE.view_list 
           || metadata.share_style === SHARE_STYLE.comment_list 
           || metadata.share_style === SHARE_STYLE.edit_list )
    {
        return metadata.share_list?.includes(userId) ?? false;
    }

    return false;
}

// returns true iff a user has comment access
// takes in the email of a user and the id of the document to check
async function userHasCommentAccess(userId: string, documentId: string)
{
    const firebase = new FirebaseWrapper();
    firebase.initApp();

    const metadata : DocumentMetadata | null = await firebase.getDocumentMetadata(documentId);
    if(metadata === null) {
        return false;
    }

    if(metadata.owner_email === userId || metadata.share_style === SHARE_STYLE.public_document)
    {
        return true;
    } else if(metadata.share_style === SHARE_STYLE.comment_list 
           || metadata.share_style === SHARE_STYLE.edit_list )
    {
        return metadata.share_list?.includes(userId) ?? false;
    }

    return false;
}

// returns true iff a user has edit access
// takes in the email of a user and the id of the document to check
async function userHasEditAccess(userId: string, documentId: string)
{
    const firebase = new FirebaseWrapper();
    firebase.initApp();

    const metadata : DocumentMetadata | null = await firebase.getDocumentMetadata(documentId);
    if(metadata === null) {
        return false;
    }

    if(metadata.owner_email === userId || metadata.share_style === SHARE_STYLE.public_document)
    {
        return true;
    } else if(metadata.share_style === SHARE_STYLE.edit_list )
    {
        return metadata.share_list?.includes(userId) ?? false;
    }

    return false;
}