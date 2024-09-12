import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { Document,  Comment, SHARE_STYLE } from '@lib/documentTypes';
import { createDocument, updateDocument, deleteDocument, getDocument } from '../document-utils/documentOperations';
import { getDocumentsOwnedByUser, getDocumentsSharedWithUser } from "../document-utils/documentBatchRead";
import { updateDocumentShareStyle, 
         updateDocumentEmoji, 
         updateDocumentColor, 
         shareDocumentWithUser, 
         unshareDocumentWithUser } from '../document-utils/updateDocumentMetadata';

import { isEqual } from 'lodash';

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
    await testDocumentMetadataUpdates(firebase);

    // await testSignUp(firebase);
    // await testDocumentAdd(firebase);
    // await testDocumentDeletion(firebase);
    // await testDocumentBatchOperations(firebase);
    // await testDocumentRead(firebase);
    // await testDocumentUpdate(firebase);
    // await testDocumentMetadataUpdate(firebase);
    // testDocumentConversion(firebase);
    process.exit(0);
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

async function testDocumentAdd(firebase: FirebaseWrapper)
{
    const doc = await createDocument(TEST_DOCUMENT.metadata.owner_email);
    console.log(`Document Id: ${doc.metadata.document_id}`);
}

async function testDocumentUpdate(firebase: FirebaseWrapper)
{
    const doc = await createDocument(TEST_DOCUMENT.metadata.owner_email);
    console.log(`Document Id: ${doc.metadata.document_id}`);
    TEST_DOCUMENT.metadata.document_id = doc.metadata.document_id;
    await updateDocument(TEST_DOCUMENT);

    const updatedDocumentTest = JSON.parse(JSON.stringify(TEST_DOCUMENT)) as Document;

    updatedDocumentTest.document_title = "New Document Title";
    const success = await updateDocument(updatedDocumentTest);
    console.log(`Document Update was successful: ${success ? "true" : "false"}`);
}

async function testDocumentMetadataUpdate(firebase: FirebaseWrapper)
{
    // initialize the document to test the update
    const doc = await createDocument(TEST_DOCUMENT.metadata.owner_email);
    console.log(`Document Id: ${doc.metadata.document_id}`);
    TEST_DOCUMENT.metadata.document_id = doc.metadata.document_id;
    const id = TEST_DOCUMENT.metadata.document_id;
    await updateDocument(TEST_DOCUMENT);

    // update the metadata
    const promises = [
        updateDocumentShareStyle(id, SHARE_STYLE.public_document),
        updateDocumentColor(id, "blue"),
        updateDocumentEmoji(id, "&#x1f602"),
        shareDocumentWithUser(id, "jeff@sample.com"),
        shareDocumentWithUser(id, PRIMARY_TEST_EMAIL)
    ];
    await Promise.resolve(promises);
    await unshareDocumentWithUser(id, PRIMARY_TEST_EMAIL);

    const result = await getDocument(id);
    console.log(`Resulting Document: ${result.metadata.document_id}`);
}

async function testDocumentDeletion(firebase: FirebaseWrapper)
{
    const doc = await createDocument(TEST_DOCUMENT.metadata.owner_email);
    console.log(`Document Id: ${doc.metadata.document_id}`);
    await deleteDocument(doc);
}

async function testDocumentRead(firebase: FirebaseWrapper)
{
    const knownId = "KNEF2dejM457Fj6KR2Ah";
    const document = await getDocument(knownId);
    console.log(`Document Data: ${JSON.stringify(document)}`);
}


async function testDocumentBatchOperations(firebase: FirebaseWrapper): Promise<void>
{
    const userId = PRIMARY_TEST_EMAIL;
    const owned = await getDocumentsOwnedByUser(userId);
    console.log(`Owned Documents: ${owned.map((doc) => doc.metadata.document_id).join(',')}`)
}

/*
Start of Automated Unit Testing

TODO
* Control these tests with the pnpm test call
* automatically run tests before merging (yaml)
* Functions to add to these tests:
* update metadata functions (x4)
* addDocument, deleteDocument, getDocument in documentOperations.ts
* user permission functions in permissionVerification.ts
*/

/* UTILITIES */
// there's probably a better way to do this
function assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
        console.error(msg);
        process.exit(1);
        // throw new Error(msg);
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
    await updateDocument(SOURCE_DOCUMENT);

    // update the metadata to alternative values
    await Promise.all([
        updateDocumentShareStyle(id, SHARE_STYLE.public_document),
        updateDocumentColor(id, "blue"),
        updateDocumentEmoji(id, "&#x1f602"),
        shareDocumentWithUser(id, SECONDARY_TEST_EMAIL),
        shareDocumentWithUser(id, TERTIARY_TEST_EMAIL),
    ]);
    await unshareDocumentWithUser(id, TERTIARY_TEST_EMAIL);

    // update source of truth
    SOURCE_DOCUMENT.metadata.share_style = SHARE_STYLE.public_document;
    SOURCE_DOCUMENT.metadata.preview_color = "blue";
    SOURCE_DOCUMENT.metadata.preview_emoji = "&#x1f602";
    SOURCE_DOCUMENT.metadata.share_list = [SECONDARY_TEST_EMAIL];

    // grab the stored information
    const databaseDocument = await getDocument(id);
    const secondaryUserShares = await getDocumentsSharedWithUser(SECONDARY_TEST_EMAIL);
    const tertiaryUserShares = await getDocumentsSharedWithUser(TERTIARY_TEST_EMAIL);

    // verification checks
    assert(isEqual(SOURCE_DOCUMENT, databaseDocument));
    // the shared document is in the shared list
    assert(secondaryUserShares.filter((sharedDoc) => 
        sharedDoc.metadata.document_id === id)
        .length > 0);
    // the shared document is not in the shared list
    assert(tertiaryUserShares.filter((sharedDoc) => 
        sharedDoc.metadata.document_id === id)
        .length === 0);
}
