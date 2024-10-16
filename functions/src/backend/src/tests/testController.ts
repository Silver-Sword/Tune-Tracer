// import { getDefaultCompositionData } from '../../../lib/src/CompToolData';
// import { DocumentPreview, ShareStyle } from '../../../lib/src/documentProperties';
// import { Document } from '../../../lib/src/Document';
// // import { OnlineEntity, UpdateType } from '../../../lib/src/realtimeUserTypes';

// import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
// import { createDocument, updateDocument, deleteDocument, getDocument, processDocumentUpdate } from '../document-utils/documentOperations';
// import { 
//     getDocumentPreviewsOwnedByUser, 
//     getDocumentPreviewsSharedWithUser, 
//     getSingleDocumentPreview, 
//     getTrashedDocumentPreviews 
// } from "../document-utils/documentBatchRead";
// // import { subscribeToDocument } from "../document-utils/realtimeDocumentUpdates";
// // import { 
//     // recordOnlineUserUpdatedDocument, 
//     // subscribeUserToUserDocumentPool, 
//     // updateUserCursor 
// // } from "../document-utils/realtimeOnlineUsers";
// import { 
//     createShareCode, 
//     deleteShareCode, 
//     getDocumentIdFromShareCode 
// } from "../document-utils/sharing/sharingUtils";
// import { 
//     shareDocumentWithUser, 
//     updateDocumentShareStyle,
//     unshareDocumentWithUser,
//     updateDocumentTrashedStatus 
// } from '../document-utils/updateDocumentMetadata';
// import { 
//     updateDocumentColor, 
//     updateDocumentEmoji, 
//     updateDocumentFavoritedStatus 
// } from '../document-utils/updateUserLevelDocumentProperties';

// import { isEqual } from 'lodash';

// // const PRIMARY_TEST_EMAIL = "test-user-1@tune-tracer.com";
// const PRIMARY_TEST_ID = "OgGilSJwqCW3qMuHWlChEYka9js1";
// // const TEST_PASSWORD = "This*Is*A*Strong*Password100!";
// const SECONDARY_TEST_ID = "d0zM0dYlUdTR1qf7QFOLQWPQ5qA2";
// const TERTIARY_TEST_ID = "1HyvutGfMdaQmaU2ASTIBP8h4HT2";

// // to test: 
// // check sign up correctly add user in user collection
// // check document creation correctly adds document to user owned documents
// // check get user owned documents correctly grabbed

// const TEST_DOCUMENT: Document = {
//     composition: getDefaultCompositionData(),
//     comments: [
//         {
//             comment_id: "1234",
//             content: "help me I'm a comment",
//             author_id: PRIMARY_TEST_ID,
//             is_reply: false,
//             time_created: 1234556,
//             last_edit_time: 1234556,
//         }
//     ],
//     metadata: {
//         document_id: "test_document_id",
//         owner_id: PRIMARY_TEST_ID,
//         share_link_style: ShareStyle.NONE,
//         share_list: {},
//         time_created: 0,
//         last_edit_time: 12,
//         last_edit_user: PRIMARY_TEST_ID,
//         is_trashed: false,
//     },
//     document_title: "Document Title",
// };

// export async function runTest()
// {
//     const firebase: FirebaseWrapper = new FirebaseWrapper();
//     firebase.initApp();

//     await runAllUnitTests(firebase);

//     // await testDocumentChanges();
//     // await testUserRegistrationToDocument(firebase);
//     // await testSignUp(firebase);
//     // await testDocumentDeletion(firebase);
//     // await testDocumentUpdate(firebase);
    
//     console.log(`Tests completed successfully`);
//     // process.exit(0);
// }

// async function runAllUnitTests(firebase: FirebaseWrapper)
// {
//     await testUserLevelProperties(firebase),
//     await testDocumentMetadataUpdates(firebase);
//     await testShareCodeFunctions(firebase);
//     await testDocumentTrashing(firebase);
// }

// // export async function testDocumentChanges()
// // {
// //     // create the document
// //     const SOURCE_DOCUMENT = JSON.parse(JSON.stringify(TEST_DOCUMENT)) as Document;
// //     const document = await createDocument(TEST_DOCUMENT.metadata.owner_id);
// //     const id = document.metadata.document_id;
// //     SOURCE_DOCUMENT.metadata.document_id = id;
// //     console.log(`Document Id: ${id}`);
    
// //     let currentDocument = SOURCE_DOCUMENT;
// //     const user = {
// //         user_email: PRIMARY_TEST_EMAIL,
// //         user_id: PRIMARY_TEST_ID,
// //         display_name: "ADMIN_CHECK"
// //     };

// //     // subscribe to updates
// //     await subscribeToDocument(
// //         id, 
// //         user, 
// //         (updatedDocument: Document) => {
// //             console.log(`Detected changes in document ${id}`);
// //             console.log(`Updated Document: ${JSON.stringify(updatedDocument)}`);
// //             currentDocument = updatedDocument;
// //         }, 
// //         (updateType: UpdateType, onlineEntity: OnlineEntity) => {
// //             console.log(`Update type ${updateType} with entity: ${JSON.stringify(onlineEntity)}`);
// //         }
// //     );

// //     // setting document to test document
// //     console.log(`Setting initial document...`);
// //     await updateDocument(SOURCE_DOCUMENT, PRIMARY_TEST_ID);
// //     console.log(`Updating Document Color...`);
// //     await updateDocumentColor(id, "blue", user.user_email);
// //     console.log(`Updating cursor...`)
// //     await updateUserCursor(id, {user_id: user.user_id, cursor: "over there"});
// //     console.log(`Completed test`);
// // }

// // async function testSignUp(firebase: FirebaseWrapper)
// // {
// //     await firebase.signUpNewUser(PRIMARY_TEST_EMAIL, TEST_PASSWORD, "adminTest1");
// // }

// // async function testLogIn(firebase: FirebaseWrapper)
// // {
// //     await firebase.signInUser(PRIMARY_TEST_EMAIL, TEST_PASSWORD)
// //     .then(() => {
// //         console.log("Sign in Successful!")
// //     }).catch((error) => {
// //         console.log(`Error caught: ${(error as Error).message}`)
// //     });
// // }

// // async function testDocumentUpdate(firebase: FirebaseWrapper)
// // {
// //     const doc = await createDocument(TEST_DOCUMENT.metadata.owner_id);
// //     console.log(`Document Id: ${doc.metadata.document_id}`);
// //     TEST_DOCUMENT.metadata.document_id = doc.metadata.document_id;
// //     await updateDocument(TEST_DOCUMENT, PRIMARY_TEST_ID);

// //     const updatedDocumentTest = JSON.parse(JSON.stringify(TEST_DOCUMENT)) as Document;

// //     updatedDocumentTest.document_title = "New Document Title";
// //     const success = await updateDocument(updatedDocumentTest, PRIMARY_TEST_ID);
// //     console.log(`Document Update was successful: ${success ? "true" : "false"}`);
// // }

// // async function testDocumentDeletion(firebase: FirebaseWrapper)
// // {
// //     const doc = await createDocument(TEST_DOCUMENT.metadata.owner_id);
// //     console.log(`Document Id: ${doc.metadata.document_id}`);
// //     await deleteDocument(doc, TEST_DOCUMENT.metadata.owner_id);
// // }

// // async function testUserRegistrationToDocument(firebase: FirebaseWrapper) {
// //     const doc = await createDocument(TEST_DOCUMENT.metadata.owner_id);
// //     const documentId = doc.metadata.document_id;
// //     console.log(`Document Id: ${documentId}`);

// //     const userId = "idk";
// //     const userEntity = {
// //         user_email: PRIMARY_TEST_EMAIL,
// //         user_id: userId,
// //         display_name: "ADMIN_TEST"
// //     };
    
// //     await subscribeUserToUserDocumentPool(documentId, userEntity, (updateType: UpdateType, onlineEntity: OnlineEntity) =>
// //     {
// //         console.log(`Update ${updateType} with entity=${JSON.stringify(onlineEntity)}`);
// //     });
// //     await recordOnlineUserUpdatedDocument(documentId, {user_id: userId});
// //     await updateUserCursor(documentId, {user_id: userId, cursor: "right here"});
// // }

// /*
// Start of Automated Unit Testing

// TODO
// * Control these tests with the pnpm test call
// * automatically run tests before merging (yaml)
// * Functions to add to these tests:
// *   deleteDocument
// *   user permission functions in permissionVerification.ts
// */

// /* UTILITIES */
// // there's probably a better way to do this
// function assert(condition: any, msg?: string): asserts condition {
//     if (!condition) {
//         if(msg) console.error(msg);
//         process.exit(1);
//     }
// }

// // function sortKeysOfDocument(document: Document): Document
// // {
// //     // Create a new object with sorted keys
// //     const documentCopy = Object.keys(document).sort().reduce((acc, key) => {
// //         acc[key] = (document as any)[key];
// //         return acc;
// //     }, {} as Record<string, any>);
// //     return JSON.parse(JSON.stringify(documentCopy)) as Document;
// // }

// function documentInPreviews(documentId: string, previews: DocumentPreview[]): boolean
// {
//     return previews.filter((preview) => preview.document_id === documentId).length > 0;
// }

// /* TESTS */
// // calls all metadata update functions for a document and checks that the resulting document is correct
// // also checks the share lists of the users that should and should not have access to the document
// async function testDocumentMetadataUpdates(firebase: FirebaseWrapper)
// {
//     // create the initial document
//     const SOURCE_DOCUMENT = TEST_DOCUMENT as Document;
//     const document = await createDocument(TEST_DOCUMENT.metadata.owner_id);
//     const id = document.metadata.document_id;
//     SOURCE_DOCUMENT.metadata.document_id = id;
//     console.log(`Document Id: ${id}`);
//     await updateDocument(SOURCE_DOCUMENT, PRIMARY_TEST_ID);

//     // update the metadata to alternative values
//     await Promise.all([
//         updateDocumentShareStyle(id, ShareStyle.WRITE, PRIMARY_TEST_ID),
//         shareDocumentWithUser(id, SECONDARY_TEST_ID, ShareStyle.WRITE, PRIMARY_TEST_ID),
//         shareDocumentWithUser(id, TERTIARY_TEST_ID, ShareStyle.COMMENT, PRIMARY_TEST_ID),
//     ]);
//     await unshareDocumentWithUser(id, TERTIARY_TEST_ID, PRIMARY_TEST_ID);
//     await processDocumentUpdate({document_title: 'Updated Title'}, id, SECONDARY_TEST_ID);

//     // update source of truth
//     SOURCE_DOCUMENT.metadata.share_link_style = ShareStyle.WRITE;
//     SOURCE_DOCUMENT.metadata.share_list[SECONDARY_TEST_ID] = ShareStyle.WRITE;
//     SOURCE_DOCUMENT.document_title = 'Updated Title';

//     // grab the stored information
//     const databaseDocument = await getDocument(id, PRIMARY_TEST_ID);
//     let secondaryUserShares = await getDocumentPreviewsSharedWithUser(SECONDARY_TEST_ID);
//     let tertiaryUserShares = await getDocumentPreviewsSharedWithUser(TERTIARY_TEST_ID);

//     // verification checks
//     SOURCE_DOCUMENT.metadata.last_edit_time = databaseDocument.metadata.last_edit_time;
//     SOURCE_DOCUMENT.metadata.last_edit_user = SECONDARY_TEST_ID;
//     // SOURCE_DOCUMENT.metadata.last_edit_user = SECONDARY_TEST_ID;
//     assert(isEqual(SOURCE_DOCUMENT, databaseDocument), `Source document and firestore document are not equal`);
//     // the shared document is in the shared list
//     assert(
//         documentInPreviews(id, secondaryUserShares),
//         `Secondary user shared list not updated with the new document id`
//     );
//     // the shared document is not in the shared list
//     assert(
//         !documentInPreviews(id, tertiaryUserShares),
//         `Tertiary user has new document id in its shared list, but shouldn't`        
//     );

//     // test access list
//     await getDocument(document.metadata.document_id, TERTIARY_TEST_ID);
//     tertiaryUserShares = await getDocumentPreviewsSharedWithUser(TERTIARY_TEST_ID);
//     assert(
//         documentInPreviews(id, tertiaryUserShares),
//         `Tertiary user shared list not updated with the document`
//     );
//     await updateDocumentShareStyle(document.metadata.document_id, ShareStyle.NONE, PRIMARY_TEST_ID);
//     tertiaryUserShares = await getDocumentPreviewsSharedWithUser(TERTIARY_TEST_ID);
//     assert(tertiaryUserShares
//         .filter((sharedDoc) => sharedDoc.document_id === id)
//         .length === 0,
//     `Tertiary user shared list not updated with the document`
//     );

//     await deleteDocument(databaseDocument, PRIMARY_TEST_ID);
// }

// async function testShareCodeFunctions(firebase: FirebaseWrapper)
// {
//     console.log(`Testing Share Code Functions...`);
//     const document = await createDocument(PRIMARY_TEST_ID);
//     const documentId = document.metadata.document_id;

//     const shareCode1 = await createShareCode(documentId);
//     await deleteShareCode(documentId, shareCode1);

//     const shareCode2 = await createShareCode(documentId);

//     // share code maps correctly to document
//     assert((await getDocumentIdFromShareCode(shareCode2)) === documentId);
//     // share code was correctly deleted
//     assert((await getDocumentIdFromShareCode(shareCode1)) === null);
//     // check structure of code
//     assert(shareCode2.length === 6);
//     assert(Number(shareCode2) >= 0 && Number(shareCode2) < 1_000_000);

//     await deleteDocument(document, PRIMARY_TEST_ID);
// }

// async function testDocumentTrashing(firebase: FirebaseWrapper)
// {
//     console.log(`Testing Document Trashing Functions...`);
//     const document = await createDocument(PRIMARY_TEST_ID);
//     const documentId = document.metadata.document_id;

//     await shareDocumentWithUser(documentId, SECONDARY_TEST_ID, ShareStyle.COMMENT, PRIMARY_TEST_ID);

//     const getPreviews = async (userId: string) => [
//         await getDocumentPreviewsOwnedByUser(userId),
//         await getDocumentPreviewsSharedWithUser(userId),
//         await getTrashedDocumentPreviews(userId)
//     ];

//     // check the three lists of each
//     let primaryPreviews = await getPreviews(PRIMARY_TEST_ID), 
//         secondaryPreview = await getPreviews(SECONDARY_TEST_ID);

//     assert(documentInPreviews(documentId, primaryPreviews[0]), `Document ${documentId} not in primary owned list`);
//     assert(!documentInPreviews(documentId, primaryPreviews[2]), `Document ${documentId} found in author's trash`);
//     assert(documentInPreviews(documentId, secondaryPreview[1]), `Document ${documentId} not in secondary's shared list`);
//     assert(!documentInPreviews(documentId, secondaryPreview[2]), `Document ${documentId} found in secondary's trash`);

//     await updateDocumentTrashedStatus(documentId, true, PRIMARY_TEST_ID);
//     primaryPreviews = await getPreviews(PRIMARY_TEST_ID);
//     secondaryPreview = await getPreviews(SECONDARY_TEST_ID);

//     assert(!documentInPreviews(documentId, primaryPreviews[0]), `Document ${documentId} still in primary owned list`);
//     assert(documentInPreviews(documentId, primaryPreviews[2]), `Document ${documentId} not found in author's trash`);
//     assert(!documentInPreviews(documentId, secondaryPreview[1]), `Document ${documentId} still in secondary's shared list`);
//     assert(!documentInPreviews(documentId, secondaryPreview[2]), `Document ${documentId} found in secondary's trash`);

//     await deleteDocument(document, PRIMARY_TEST_ID);
//     assert(!documentInPreviews(documentId, await getTrashedDocumentPreviews(PRIMARY_TEST_ID)));
// }

// async function testUserLevelProperties(firebase: FirebaseWrapper)
// {
//     console.log(`Testing User Level Properties Functions...`);
//     const document = await createDocument(PRIMARY_TEST_ID);
//     const documentId = document.metadata.document_id;

//     await shareDocumentWithUser(documentId, SECONDARY_TEST_ID, ShareStyle.COMMENT, PRIMARY_TEST_ID);

//     await updateDocumentColor(documentId, "blue", PRIMARY_TEST_ID);
//     await updateDocumentColor(documentId, "red", SECONDARY_TEST_ID);
//     await updateDocumentFavoritedStatus(documentId, true, SECONDARY_TEST_ID);
//     await updateDocumentEmoji(documentId, ":smile:", PRIMARY_TEST_ID);

//     const primaryPreview = await getSingleDocumentPreview(documentId, PRIMARY_TEST_ID);
//     assert(
//         primaryPreview.is_favorited === false &&
//         primaryPreview.preview_color === "blue" &&
//         primaryPreview.preview_emoji === ":smile:",
//         `Primary preview is incorrect. Expected {is_favorited: false, preview_color:"blue", preview_emoji:":smile:"}, got: \n${JSON.stringify(primaryPreview)}`
//     );

//     const secondaryPreview = await getSingleDocumentPreview(documentId, SECONDARY_TEST_ID);
//     assert(
//         secondaryPreview.is_favorited === true &&
//         secondaryPreview.preview_color === "red" &&
//         secondaryPreview.preview_emoji === undefined,
//         `Secondary preview is incorrect. Expected {is_favorited: true, preview_color:"red", preview_emoji:undefined}, got: \n${JSON.stringify(secondaryPreview)}`
//     );
    

//     await deleteDocument(document, PRIMARY_TEST_ID);
// }