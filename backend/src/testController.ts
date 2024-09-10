import FirebaseWrapper from "./firebase-utils/FirebaseWrapper";
import { Document,  Comment } from '@lib/documentTypes';
import { createDocument, updateDocument, deleteDocument, getDocument } from './document-utils/documentOperations';
import { getDocumentsOwnedByUser, getDocumentsSharedWithUser } from "./document-utils/documentBatchRead";

const TEST_EMAIL = "chrisgittingsucf@gmail.com";
const TEST_PASSWORD = "ThisIsAStrongPassword*50";

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
            author_email: TEST_EMAIL,
            is_reply: false,
            time_created: 1234556,
            last_edit_time: 1234556,
        }
    ],
    metadata: {
        document_id: "test_document_id",
        owner_email: TEST_EMAIL,
        share_style: 1,
        time_created: 0,
        last_edit_time: 12,
        last_edit_user: TEST_EMAIL,
    },
    document_title: "Document Title",
};

export async function runTest()
{
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    firebase.initApp();
    // await testSignUp(firebase);
    await testDocumentAdd(firebase);
    // await testDocumentDeletion(firebase);
    // await testDocumentBatchOperations(firebase);
    await testDocumentRead(firebase);
    await testDocumentUpdate(firebase);
    // testDocumentConversion(firebase);
    process.exit(0);
}

async function testSignUp(firebase: FirebaseWrapper)
{
    await firebase.signUpNewUser(TEST_EMAIL, TEST_PASSWORD, "adminTest1");
}

async function testLogIn(firebase: FirebaseWrapper)
{
    await firebase.signInUser(TEST_EMAIL, TEST_PASSWORD)
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

function sortKeysOfDocument(document: Document): Document
{
    // Create a new object with sorted keys
    const documentCopy = Object.keys(document).sort().reduce((acc, key) => {
        acc[key] = (document as any)[key];
        return acc;
    }, {} as Record<string, any>);
    return JSON.parse(JSON.stringify(documentCopy)) as Document;
}

async function testDocumentBatchOperations(firebase: FirebaseWrapper): Promise<void>
{
    const userId = TEST_EMAIL;
    const owned = await getDocumentsOwnedByUser(userId);
    console.log(`Owned Documents: ${owned.map((doc) => doc.metadata.document_id).join(',')}`)
}