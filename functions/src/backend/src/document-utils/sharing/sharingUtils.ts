// TO DO: add auth
import { getFirebase } from "../../firebase-utils/FirebaseWrapper";
import { ShareCodeEntity } from "./ShareCodeEntity";

const MINUTES_TO_MILLISECONDS = 60000;
const SHARE_CODE_LIFESPAN = 2 * 60 * MINUTES_TO_MILLISECONDS + 1000; // currently set to 2 hours plus some wiggle room

/**
 * @param shareCode the 6 digit code that can be used to share a document
 * @returns a promise containing the document id associated with the share code 
 * if it exists and has not expired or null otherwise
 */
export async function getDocumentIdFromShareCode(shareCode: string): Promise<string | null>
{
    const entity = await getShareCodeEntity(shareCode);
    if(entity === null || entity.expiration_time < Date.now())
    {
        return null;
    }
    return entity.documentId;
}

/**
 * Creates and returns a 6 digit share code after adding it to the database. 
 * Preferably, only have one of these active at a time for a document.
 * @param documentId the id of the document that will be associated with the share code
 * @returns a promise containing the new share code for the document
 */
export async function createShareCode(documentId: string): Promise<string>
{
    let existingShareCode: ShareCodeEntity | null;
    let shareCode: string;
    const FIVE_MINUTES = 300000;

    // create a random share code
    do {
        shareCode = getRandomShareCode();
        existingShareCode = await getShareCodeEntity(shareCode);

    // check that a document is not already using this share code
    } while(existingShareCode !== null && existingShareCode.expiration_time + FIVE_MINUTES >= Date.now());

    // add this share code to the database
    const currentTime = Date.now();
    await getFirebase().setShareCodeEntity({
        documentId: documentId,
        time_created: currentTime,
        expiration_time: currentTime + SHARE_CODE_LIFESPAN,
        code: shareCode,
    });

    // return the share code
    return shareCode;
}

/**
 * Deletes the share code associated with the document. Will do nothing if the share code does not exist.
 * Will throw an error if the documentId does not match the given share code.  
 * @param documentId the id of the document from which the share code is being scrubbed
 * @param shareCode the code that is being removed from the document
 */
export async function deleteShareCode(documentId: string, shareCode: string): Promise<void>
{
    const trueDocumentId: string | null = await getDocumentIdFromShareCode(shareCode);
    if(!trueDocumentId) {
        return;
    }

    if(trueDocumentId !== documentId)
    {
        throw Error(`Trying to remove share code ${shareCode} from document ${documentId}, but document does not own share code.`);
    }

    // delete the share code entry from the database
    return getFirebase().deleteShareCodeEntity(shareCode);
}


// gets and returns the share code entity from the database
async function getShareCodeEntity(shareCode: string): Promise<ShareCodeEntity | null>
{
    return getFirebase().getShareCodeEntity(shareCode);
}

// generates a random integer between 0 and 999,999 (inclusive) with 6 digits
function getRandomShareCode(): string
{
    const low = 0, high = 1_000_000;
    const value = Math.floor(Math.random() * (high - low) + low);
    return String(value).padStart(6, "0");
}