import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { Document,  SHARE_STYLE } from '@lib/documentTypes';
import { createDocument, updateDocument, deleteDocument, getDocument } from '../document-utils/documentOperations';
import { getDocumentPreviewsOwnedByUser, getDocumentPreviewsSharedWithUser } from "../document-utils/documentBatchRead";
import { subscribeToDocumentUpdates } from "../document-utils/realtimeDocumentUpdates";
import { recordOnlineUserUpdatedDocument, subscribeUserToUserDocumentPool, updateUserCursor } from "../document-utils/realtimeOnlineUsers";
import { 
    updateDocumentShareStyle,       
    updateDocumentEmoji, 
    updateDocumentColor, 
    shareDocumentWithUser, 
    unshareDocumentWithUser 
} from '../document-utils/updateDocumentMetadata';

import { isEqual } from 'lodash';
import { OnlineEntity, UpdateType } from "@lib/userTypes";

const PRIMARY_TEST_EMAIL = "test-user-1@tune-tracer.com";
const TEST_PASSWORD = "This*Is*A*Strong*Password100!";
const SECONDARY_TEST_EMAIL = "test-user-2@tune-tracer.com";
const TERTIARY_TEST_EMAIL = "test-user-3@tune-tracer.com";

// to test: 
// check sign up correctly add user in user collection
// check document creation correctly adds document to user owned documents
// check get user owned documents correctly grabbed

const TEST_DOCUMENT: Document = {
    contents: JSON.parse(JSON.stringify({
        json_list: ["help", "me", "plz"],
        user_id: "@email.com"
    })),
    comments: [
        {
            comment_id: "1234",
            content: "help me I'm a comment",
            author_email: PRIMARY_TEST_EMAIL,
            is_reply: false,
            time_created: 1234556,
            last_edit_time: 1234556,
        }
    ],
    metadata: {
        document_id: "test_document_id",
        owner_email: PRIMARY_TEST_EMAIL,
        share_style: 1,
        time_created: 0,
        last_edit_time: 12,
        last_edit_user: PRIMARY_TEST_EMAIL,
    },
    document_title: "Document Title",
};

export async function runTest()
{
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    firebase.initApp();

    // await runAllUnitTests(firebase);
    await testUserRegistrationToDocument(firebase);
    
    // await testSignUp(firebase);
    // await testDocumentDeletion(firebase);
    // await testDocumentUpdate(firebase);
    
    console.log(`Tests completed successfully`);
    // process.exit(0);
}

async function runAllUnitTests(firebase: FirebaseWrapper)
{
    await testDocumentMetadataUpdates(firebase);
}

export async function testDocumentChanges()
{
    // create the document
    const SOURCE_DOCUMENT = JSON.parse(JSON.stringify(TEST_DOCUMENT)) as Document;
    const document = await createDocument(TEST_DOCUMENT.metadata.owner_email);
    const id = document.metadata.document_id;
    SOURCE_DOCUMENT.metadata.document_id = id;
    console.log(`Document Id: ${id}`);
    await updateDocument(SOURCE_DOCUMENT, PRIMARY_TEST_EMAIL);

    let currentDocument = SOURCE_DOCUMENT;

    // subscribe to updates
    subscribeToDocumentUpdates(id, (updatedDocument: Document) => {
        console.log(`Detected changes in document ${id}`);
        console.log(`Updated Document: ${JSON.stringify(updatedDocument)}`);
        currentDocument = updatedDocument;
    });
}

async function testSignUp(firebase: FirebaseWrapper)
{
    await firebase.signUpNewUser(PRIMARY_TEST_EMAIL, TEST_PASSWORD, "adminTest1");
}

async function testLogIn(firebase: FirebaseWrapper)
{
    await firebase.signInUser(PRIMARY_TEST_EMAIL, TEST_PASSWORD)
    .then(() => {
        console.log("Sign in Successful!")
    }).catch((error) => {
        console.log(`Error caught: ${(error as Error).message}`)
    });
}

async function testDocumentUpdate(firebase: FirebaseWrapper)
{
    const doc = await createDocument(TEST_DOCUMENT.metadata.owner_email);
    console.log(`Document Id: ${doc.metadata.document_id}`);
    TEST_DOCUMENT.metadata.document_id = doc.metadata.document_id;
    await updateDocument(TEST_DOCUMENT, PRIMARY_TEST_EMAIL);

    const updatedDocumentTest = JSON.parse(JSON.stringify(TEST_DOCUMENT)) as Document;

    updatedDocumentTest.document_title = "New Document Title";
    const success = await updateDocument(updatedDocumentTest, PRIMARY_TEST_EMAIL);
    console.log(`Document Update was successful: ${success ? "true" : "false"}`);
}

async function testDocumentDeletion(firebase: FirebaseWrapper)
{
    const doc = await createDocument(TEST_DOCUMENT.metadata.owner_email);
    console.log(`Document Id: ${doc.metadata.document_id}`);
    await deleteDocument(doc, TEST_DOCUMENT.metadata.owner_email);
}

async function testUserRegistrationToDocument(firebase: FirebaseWrapper) {
    const doc = await createDocument(TEST_DOCUMENT.metadata.owner_email);
    const documentId = doc.metadata.document_id;
    console.log(`Document Id: ${documentId}`);

    const userId = "idk";
    const userEntity = {
        user_email: PRIMARY_TEST_EMAIL,
        user_id: userId,
        display_name: "ADMIN_TEST"
    };
    
    await subscribeUserToUserDocumentPool(documentId, userEntity, (updateType: UpdateType, onlineEntity: OnlineEntity) =>
    {
        console.log(`Update ${updateType} with entity=${JSON.stringify(onlineEntity)}`);
    });
    await recordOnlineUserUpdatedDocument(documentId, {user_id: userId});
    await updateUserCursor(documentId, {user_id: userId, cursor: "right here"});
}

/*
Start of Automated Unit Testing

TODO
* Control these tests with the pnpm test call
* automatically run tests before merging (yaml)
* Functions to add to these tests:
*   deleteDocument
*   user permission functions in permissionVerification.ts
*/

/* UTILITIES */
// there's probably a better way to do this
function assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
        if(msg) console.error(msg);
        process.exit(1);
    }
}

function sortKeysOfDocument(document: Document): Document
{
    // Create a new object with sorted keys
    const documentCopy = Object.keys(document).sort().reduce((acc, key) => {
        acc[key] = (document as any)[key];
        return acc;
    }, {} as Record<string, any>);
    return JSON.parse(JSON.stringify(documentCopy)) as Document;
}

/* TESTS */
// calls all metadata update functions for a document and checks that the resulting document is correct
// also checks the share lists of the users that should and should not have access to the document
async function testDocumentMetadataUpdates(firebase: FirebaseWrapper)
{
    // create the initial document
    const SOURCE_DOCUMENT = JSON.parse(JSON.stringify(TEST_DOCUMENT)) as Document;
    const document = await createDocument(TEST_DOCUMENT.metadata.owner_email);
    const id = document.metadata.document_id;
    SOURCE_DOCUMENT.metadata.document_id = id;
    console.log(`Document Id: ${id}`);
    await updateDocument(SOURCE_DOCUMENT, PRIMARY_TEST_EMAIL);

    // update the metadata to alternative values
    await Promise.all([
        updateDocumentShareStyle(id, SHARE_STYLE.edit_list, PRIMARY_TEST_EMAIL),
        updateDocumentColor(id, "blue", PRIMARY_TEST_EMAIL),
        updateDocumentEmoji(id, "&#x1f602", PRIMARY_TEST_EMAIL),
        shareDocumentWithUser(id, SECONDARY_TEST_EMAIL, PRIMARY_TEST_EMAIL),
        shareDocumentWithUser(id, TERTIARY_TEST_EMAIL, PRIMARY_TEST_EMAIL),
    ]);
    await unshareDocumentWithUser(id, TERTIARY_TEST_EMAIL, PRIMARY_TEST_EMAIL);
    await updateDocumentEmoji(id, ":celebration:", SECONDARY_TEST_EMAIL);

    // update source of truth
    SOURCE_DOCUMENT.metadata.share_style = SHARE_STYLE.edit_list;
    SOURCE_DOCUMENT.metadata.preview_color = "blue";
    SOURCE_DOCUMENT.metadata.preview_emoji = ":celebration:";
    SOURCE_DOCUMENT.metadata.share_list = [SECONDARY_TEST_EMAIL];

    // grab the stored information
    const databaseDocument = await getDocument(id, PRIMARY_TEST_EMAIL);
    const secondaryUserShares = await getDocumentPreviewsSharedWithUser(SECONDARY_TEST_EMAIL);
    const tertiaryUserShares = await getDocumentPreviewsSharedWithUser(TERTIARY_TEST_EMAIL);

    // verification checks
    SOURCE_DOCUMENT.metadata.last_edit_time = databaseDocument.metadata.last_edit_time;
    SOURCE_DOCUMENT.metadata.last_edit_user = SECONDARY_TEST_EMAIL;
    assert(isEqual(SOURCE_DOCUMENT, databaseDocument), `Source document and firestore document are not equal`);
    // the shared document is in the shared list
    assert(secondaryUserShares
                .filter((sharedDoc) => sharedDoc.document_id === id)
                .length > 0,
            `Secondary user shared list not updated with the new document id`
    );
    // the shared document is not in the shared list
    assert(tertiaryUserShares
                .filter((sharedDoc) => sharedDoc.document_id === id)
                .length === 0,
            `Tertiary user has new document id in its shared list, but shouldn't`        
    );
}
