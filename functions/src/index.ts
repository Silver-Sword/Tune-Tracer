/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

"use strict";

// [START all]
// [START import]
// The Cloud Functions for Firebase SDK to setup triggers and logging.
const functions = require('firebase-functions/v1');
const express = require('express');
const app = express();

// const adminApp = require('.backend/src/firebaseSecrets');
// const express = require('express');
// const {logger} = require("firebase-functions");
const { signUpAPI, login } = require('./backend/src/endpoints/loginEndpoints');
const { getAllDocuments, getUserDocuments, getSharedDocuments } = require('./backend/src/endpoints/readEndpoints');
const { createShareCode, deleteShareCode } = require('./backend/src/document-utils/sharing/sharingUtils');
const { getTrashedDocumentPreviews } = require('./backend/src/document-utils/documentBatchRead');
const {updateDocumentEmoji, updateDocumentColor, updateDocumentFavoritedStatus} = require('./backend/src/document-utils/updateUserLevelDocumentProperties');
const { createWorkspace } = require('./backend/src/endpoints/createEndpoint');
const { deleteWorkspace } = require('./backend/src/endpoints/deleteEndpoint');
// const { subscribeToDocument } = require('./backend/src/document-utils/realtimeDocumentUpdates');
const { updateUserCursor } = require('./backend/src/document-utils/realtimeOnlineUsers');
// const { updatePartialDocument } = require('./backend/src/endpoints/updateEndpoints');
const { updateDocumentShareStyle, updateDocumentTrashedStatus } = require('./backend/src/document-utils/updateDocumentMetadata');
const { shareDocumentWithUser, unshareDocumentWithUser } = require('./backend/src/document-utils/updateDocumentMetadata');
const { ShareStyle } = require('./lib/src/documentProperties');
// const { Document } = require('./lib/documentTypes');
const cors = require('cors');
const corsHandler = cors({ origin: true });
// const adminApp = require('./backend/src/firebaseSecrets');
const { FIREBASE_CONFIG } = require('./backend/src/firebaseSecrets');
const firebase = require('firebase/compat/app');

// const { Request, Response } = require('express');

exports.signUpUser = functions.https.onRequest( async (req, res) => {
  corsHandler(req, res, async() => {
  try {
    // Parse user input from the request body
    // if (!req.body)
    // {
    //   throw new Error('Missing any inputs');
    // }

    const email : string = req.body.email;
    const password : string = req.body.password;
    const displayName : string = req.body.displayName;

    if (!email || !password || !displayName) {
      throw new Error('Missing required fields');
    }

    // Call the signUpAPI and await the result
    const apiResult = await signUpAPI(email, password, displayName);

    res.send({ 
      message: 'User signed up successfully', 
      data: apiResult 
    });
    } catch (error) {
      // Send an error response if something goes wrong
      console.log('Failed to sign up user:' + (error as Error).message);
      res.send({ message: 'Failed to sign up user:' + (error as Error).message, 
      data: (error as Error).message
    });
  }
  });
});

exports.logInUser = functions.https.onRequest(async (request: any, response: any) => {
  cors(request, response, async () => {
  try {
      // Parse user input from the request body
      const { email, password } = request.data;
  
      // Call the signUpAPI and await the result
      const apiResult = await login(email, password);

      if (!apiResult) 
      {
        throw new Error("Could not identify user");
      }
  
      // Send a successful response back
      response.status(200).send({ message: 'User signed in successfully', data: apiResult });
    } catch (error) {
      // Send an error response if something goes wrong
      response.status(500).send({ message: 'Failed to log in user:' + error });
    }
  });
});

// document preview endpoints

exports.getAllPreviews = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
        const userId = request.body.userId;
        const apiResult = await getAllDocuments(userId);
    
        // Send a successful response back
        response.status(200).send({ message: 'Here are all the documents', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to get documents' + error });
      }
  });
});

exports.getOwnedPreviews = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
        const userId = request.body.userId;
        const apiResult = await getUserDocuments(userId);
    
        // Send a successful response back
        response.status(200).send({ message: 'Here are all the documents', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to get documents' + error });
      }
  });
});

exports.getSharedPreviews = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
        const userId = request.body.userId;
        const apiResult = await getSharedDocuments(userId);
    
        // Send a successful response back
        response.status(200).send({ message: 'Here are all the documents', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to get documents' + error });
      }
  });
});

exports.getTrashedDocumentPreviews = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
        const userId = request.body.userId;
        const apiResult = await getTrashedDocumentPreviews(userId);
    
        // Send a successful response back
        response.status(200).send({ message: 'Here are all the documents', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to get documents' + error });
      }
  });
});

// share code endpoints

exports.createShareCode = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
        const documentId = request.body.documentId;
        const apiResult = await createShareCode(documentId);
    
        // Send a successful response back
        response.status(200).send({ message: 'Here are all the documents', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to get documents' + error });
      }
  });
});

// frontend doesnt need - make getDocumentFromShareCode instead
// getDocumentIdFromShareCode return!!!!

exports.deleteShareCode = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
        const {documentId, shareCode} = request.body;
        const apiResult = await deleteShareCode(documentId, shareCode);
    
        // Send a successful response back
        response.status(200).send({ message: 'Here are all the documents', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to get documents' + error });
      }
  });
});

// preview customization endpoints

exports.updateDocumentEmoji = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
        const {documentId, newEmoji, writerId} = request.body;
        const apiResult = await updateDocumentEmoji(documentId, newEmoji, writerId);
    
        // Send a successful response back
        response.status(200).send({ message: 'Here are all the documents', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to get documents' + error });
      }
  });
});
exports.updateDocumentColor = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {

      const {documentId, newColor, writerId} = request.body;
      const apiResult = await updateDocumentColor(documentId, newColor, writerId);
    
        // Send a successful response back
        response.status(200).send({ message: 'Here are all the documents', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to get documents' + error });
      }
  });
});

exports.updateDocumentFavoritedStatus = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const {documentId, isFavorited, writerId} = request.body;
      
      const apiResult = await updateDocumentFavoritedStatus(documentId, isFavorited as boolean, writerId);
    
        // Send a successful response back
        response.status(200).send({ message: 'Here are all the documents', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to get documents' + error });
      }
  });
});

// CRUD operations endpoints

exports.createDocument = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const userId = request.body.userId;
      
      const apiResult = await createWorkspace(userId);
    
        // Send a successful response back
        response.status(200).send({ message: 'Here are all the documents', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to get documents' + error });
      }
  });
});

exports.deleteDocument = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const userId = request.body.userId;
      
      const apiResult = await deleteWorkspace(userId);
    
        // Send a successful response back
        response.status(200).send({ message: 'Here are all the documents', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to get documents' + error });
      }
  });
});

exports.deleteDocument = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const {documentId, userId} = request.body;
      
      const apiResult = await deleteWorkspace(documentId, userId);
    
        // Send a successful response back
        response.status(200).send({ message: 'Here are all the documents', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to get documents' + error });
      }
  });
});

// exports.subscribeToDocument = functions.https.onRequest(async (request: any, response: any) => {
//   corsHandler(request, response, async () => {
//     try {
//       var currentDocument = request.body.currentDocument as Document;
//       const {documentId, userId} = request.body;
      
//       const apiResult = await subscribeToDocument(documentId, userId, 
//         (updatedDocument: Document) => {
//           console.log(`Detected changes in document ${id}`);
//           console.log(`Updated Document: ${JSON.stringify(updatedDocument)}`);
//           currentDocument = updatedDocument;
//       }, 
//       (updateType: UpdateType, onlineEntity: OnlineEntity) => {
//           console.log(`Update type ${updateType} with entity: ${JSON.stringify(onlineEntity)}`);
//       }
//       );
    
//         // Send a successful response back
//         response.status(200).send({ message: 'Here are all the documents', data: apiResult });
//       } catch (error) {
//         // Send an error response if something goes wrong
//         response.status(500).send({ message: 'Failed to get documents' + error });
//       }
//   });
// }); // return!!!

// exports.updatePartialDocument = functions.https.onRequest(async (request: any, response: any) => {
//   corsHandler(request, response, async () => {
//     try {
//       const {documentId, documentChanges} = request.body;
      
//       const apiResult = await updatePartialDocument(documentId, documentChanges);
    
//         // Send a successful response back
//         response.status(200).send({ message: 'Here are all the documents', data: apiResult });
//       } catch (error) {
//         // Send an error response if something goes wrong
//         response.status(500).send({ message: 'Failed to get documents' + error });
//       }
//   });
// }); // return!!!

// cursor endpoint 

exports.updateUserCursor = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const {documentId, userId, cursor} = request.body;
      
      const apiResult = await updateUserCursor(documentId, {userId, cursor});
    
        // Send a successful response back
        response.status(200).send({ message: 'Here are all the documents', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to get documents' + error });
      }
  });
});

// sharing endpoints

exports.updateDocumentShareStyle = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const {documentId, sharing, writerId} = request.body;
      
      const apiResult = await updateDocumentShareStyle(documentId, sharing, writerId);
        // Send a successful response back
        response.status(200).send({ message: 'Successfully updated share style to ' + ShareStyle[sharing], data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to update document sharing style. ' + error });
      }
  });
});

exports.shareDocumentWithUser = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const {documentId, userId, sharing, writerId} = request.body;
      
      const apiResult = await shareDocumentWithUser(documentId, userId, sharing, writerId);
        // Send a successful response back
        response.status(200).send({ message: 'Successfully shared document with ' + ShareStyle[sharing] + ' permissions.', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to update document sharing style. ' + error });
      }
  });
});

exports.unshareDocumentWithUser = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const {documentId, userId, writerId} = request.body;
      
      const apiResult = await unshareDocumentWithUser(documentId, userId, writerId);
        // Send a successful response back
        response.status(200).send({ message: 'Successfully removed user access to document.', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to update document sharing style. ' + error });
      }
  });
});

exports.updateDocumentTrashedStatus = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const {documentId, is_trashed, writerId} = request.body;
      
      const apiResult = await updateDocumentTrashedStatus(documentId, is_trashed, writerId);
        // Send a successful response back
        response.status(200).send({ message: 'Successfully updated trashed status to ' + is_trashed, data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to update document sharing style. ' + error });
      }
  });
});
