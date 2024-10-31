import { DocumentPreview, UserLevelDocumentProperties } from "../lib/src/documentProperties";
import { AccessType } from "../lib/src/UserEntity";

import { getFirebase } from "../firebase-utils/FirebaseWrapper";
import { getDocument } from "./documentOperations";

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
  const firebase = getFirebase();
  const documentIdList = await getDocumentIdsByUser(userId, accessTypes);
  const user = await firebase.getUser(userId);

  if(user === null)
  {
    console.warn(`Could not access user ${userId}`);
    return [];
  }
  const documentProperties = user?.preview_properties;

  const documentList: DocumentPreview[] = [];
  for (const id of documentIdList) {
    try {
      const document = await createDocumentPreview(
        id, 
        userId, 
        documentProperties ? (documentProperties as any)[id] : undefined
      );

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

// gets a Document and extracts and returns its DocumentPreview
export async function createDocumentPreview(
    documentId: string, 
    readerId: string, 
    userLevelProperties: UserLevelDocumentProperties | undefined
): Promise<DocumentPreview> {
    const document = await getDocument(documentId, readerId);

    let userLevel = userLevelProperties ?? { is_favorited: false };
    if(userLevel.is_favorited === undefined) userLevel.is_favorited = false;

    return {
        ...document.metadata, 
        ...{document_title: document.document_title},
        ...userLevel,
    };
}

// returns the list of document ids that is in the user's owned list (if isOwned is true)
// or shared with list (if isOwned is false)
async function getDocumentIdsByUser(
  userId: string,
  accessTypes: AccessType[]
): Promise<string[]> {
  const firebase = getFirebase();
  return await firebase.getUserDocuments(userId, accessTypes);
}

export async function getSingleDocumentPreview(
    documentId: string, 
    userId: string
): Promise<DocumentPreview> {
    const document = await getDocument(documentId, userId);
    const user = (await getFirebase().getUser(userId))?.preview_properties;
    
    let userLevel = user ? (user as any)[documentId] : { is_favorited: false };
    if(userLevel === undefined) userLevel = { is_favorited: false };
    if(userLevel.is_favorited === undefined) userLevel.is_favorited = false;

    return {
        ...document.metadata, 
        ...{document_title: document.document_title},
        ...userLevel,
    };
}