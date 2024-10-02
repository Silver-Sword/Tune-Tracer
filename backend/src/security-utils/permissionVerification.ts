import { DocumentMetadata, ShareStyle, Document } from "@lib/documentTypes";

// returns true iff a user has read access
// takes in the email of a user and the document to check
export function userHasReadAccess(userId: string, document: Document): boolean {
  return highestPermissions(userId, document.metadata) >= ShareStyle.READ;
}

// returns true iff a user has comment access
// takes in the email of a user and the document to check
function userHasCommentAccess(userId: string, document: Document): boolean {
  return highestPermissions(userId, document.metadata) >= ShareStyle.COMMENT;
}

// returns true iff a user has edit access
// takes in the email of a user and the document to check
export function userHasWriteAccess(
  userId: string,
  document: Document
): boolean {
  return highestPermissions(userId, document.metadata) >= ShareStyle.WRITE;
}

function highestPermissions(
  userId: string,
  metadata: DocumentMetadata
): ShareStyle {
  if (metadata === null) {
    return ShareStyle.NONE;
  } else if (metadata.owner_id === userId) {
    return ShareStyle.WRITE;
  } else if (metadata.share_list[userId] !== undefined) {
    return metadata.share_list[userId];
  } else {
    return metadata.share_link_style;
  }
}
