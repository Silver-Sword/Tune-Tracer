import { DocumentMetadata, SHARE_STYLE, Document } from "@lib/documentTypes";
import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";

// returns true iff a user has read access
// takes in the email of a user and the document to check
export function userHasReadAccess(userId: string, document: Document): boolean {
  const firebase = new FirebaseWrapper();
  firebase.initApp();

  const metadata: DocumentMetadata = document.metadata;
  if (metadata === null) {
    return false;
  } else if (
    metadata.owner_email === userId ||
    metadata.share_style === SHARE_STYLE.public_document
  ) {
    return true;
  } else if (
    metadata.share_style === SHARE_STYLE.view_list ||
    metadata.share_style === SHARE_STYLE.comment_list ||
    metadata.share_style === SHARE_STYLE.edit_list
  ) {
    return metadata.share_list?.includes(userId) ?? false;
  }

  return false;
}

// returns true iff a user has comment access
// takes in the email of a user and the document to check
function userHasCommentAccess(userId: string, document: Document): boolean {
  const firebase = new FirebaseWrapper();
  firebase.initApp();

  const metadata: DocumentMetadata = document.metadata;
  if (metadata === null) {
    return false;
  } else if (
    metadata.owner_email === userId ||
    metadata.share_style === SHARE_STYLE.public_document
  ) {
    return true;
  } else if (
    metadata.share_style === SHARE_STYLE.comment_list ||
    metadata.share_style === SHARE_STYLE.edit_list
  ) {
    return metadata.share_list?.includes(userId) ?? false;
  }

  return false;
}

// returns true iff a user has edit access
// takes in the email of a user and the document to check
export function userHasWriteAccess(
  userId: string,
  document: Document
): boolean {
  const firebase = new FirebaseWrapper();
  firebase.initApp();

  const metadata: DocumentMetadata = document.metadata;
  if (metadata === null) {
    return false;
  } else if (
    metadata.owner_email === userId ||
    metadata.share_style === SHARE_STYLE.public_document
  ) {
    return true;
  } else if (metadata.share_style === SHARE_STYLE.edit_list) {
    return metadata.share_list?.includes(userId) ?? false;
  }

  return false;
}
