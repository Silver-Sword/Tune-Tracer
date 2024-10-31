import { DocumentMetadata, ShareStyle } from "../lib/src/documentProperties";
import { highestPermissions } from "./permissionVerification";
import { getFirebase } from "../firebase-utils/FirebaseWrapper";

// Returns the highest access level a user has for a document (WRITE, COMMENT, READ, or NONE)
export async function getUserAccessLevel(userId: string, documentId: string): Promise<ShareStyle> {
    const metadata: DocumentMetadata | null = await getFirebase().getDocumentMetadata(documentId);
    if(metadata === null || metadata === undefined) {
        return ShareStyle.NONE;
    }
    return highestPermissions(userId, metadata);
}