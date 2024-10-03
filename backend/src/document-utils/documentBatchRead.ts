import { DocumentPreview } from "@lib/src/documentTypes";

import { getDocumentPreview } from "./documentOperations";
import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { AccessType } from "@lib/src/userTypes";

// returns all documents created by the user associated with the userId
export async function getDocumentPreviewsOwnedByUser(
  userId: string
): Promise<DocumentPreview[]> {
    return (await getDocumentPreviewsByUser(userId, ["owned"])).filter(
    (preview) => !preview.is_trashed
);
}

// returns all documents shared with the user associated with the userId
// this function does not distinguish between view-only shares, comment-able shares, or edit shares
export async function getDocumentPreviewsSharedWithUser(
    userId: string
): Promise<DocumentPreview[]> {
    return (
    await getDocumentPreviewsByUser(userId, ["shared", "accessed"])
).filter((preview) => !preview.is_trashed);
}

/**
 * Returns a promise containing list of DocumentPreviews of documents that have been trashed by the author
 * @param userId the id of the user who owns and trashed the document
 */
export async function getTrashedDocumentPreviews(
  userId: string
): Promise<DocumentPreview[]> {
  return (await getDocumentPreviewsByUser(userId, ["owned"])).filter(
    (preview) => preview.is_trashed
  );
}

// returns a list of DocumentPreviews that the user associated with the userId
// owns (if isOwned is true) or is shared with the user (if isOwned is false)
async function getDocumentPreviewsByUser(
    userId: string,
    accessTypes: AccessType[]
): Promise<DocumentPreview[]> {
  const firebase = new FirebaseWrapper();
  firebase.initApp();
  const documentIdList = await getDocumentIdsByUser(userId, accessTypes);
  const documentList = [];
  for (const id of documentIdList) {
    try {
      const document = await getDocumentPreview(id, userId);
      if (document === null || document === undefined) {
        continue;
      }
      documentList.push(document);
    } catch (error) {
      console.warn(
        `user ${userId} trying to access document ${id} but does not have permissions`
      );
    }
  }
  return documentList;
}

// returns the list of document ids that is in the user's owned list (if isOwned is true)
// or shared with list (if isOwned is false)
async function getDocumentIdsByUser(
  userId: string,
  accessTypes: AccessType[]
): Promise<string[]> {
  const firebase = new FirebaseWrapper();
  firebase.initApp();
  return await firebase.getUserDocuments(userId, accessTypes);
}
