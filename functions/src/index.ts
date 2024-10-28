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

const { ShareStyle } = require('./lib/src/documentProperties');
const { Document: LibDocument, getDefaultDocument } = require('./lib/src/Document');
const { getDefaultScoreData } = require('./lib/src/CompToolData');
const { UpdateType } = require('./lib/src/UpdateType');
const { UserEntity, getDefaultUser } = require('./lib/src/UserEntity');

const { signUpAPI, login } = require('./backend/src/endpoints/loginEndpoints');
const { createDocument } = require('./backend/src/document-utils/documentOperations');
const { getAllDocuments, getUserDocuments, getSharedDocuments } = require('./backend/src/endpoints/readEndpoints');
const { createShareCode, deleteShareCode, getDocumentIdFromShareCode } = require('./backend/src/document-utils/sharing/sharingUtils');
const { getTrashedDocumentPreviews } = require('./backend/src/document-utils/documentBatchRead');
const { updateDocumentEmoji, updateDocumentColor, updateDocumentFavoritedStatus } = require('./backend/src/document-utils/updateUserLevelDocumentProperties');
const { subscribeToDocument, OnlineEntity } = require('./backend/src/document-utils/realtimeDocumentUpdates');
const { updateUserCursor } = require('./backend/src/document-utils/realtimeOnlineUsers');
const { updateDocumentShareStyle, updateDocumentTrashedStatus } = require('./backend/src/document-utils/updateDocumentMetadata');
const { 
  shareDocumentWithUser, 
  unshareDocumentWithUser,
  updatePartialDocument, 
  deleteDocument 
} = require('./backend/src/document-utils/updateDocumentMetadata');
const {
  createComment,
  deleteComment,
  editCommentText,
  subscribeToComments
} = require('./backend/src/comment-utils/commentOperations');
const { getUserIdFromEmail } = require('./backend/src/user-utils/getUserData');
const { Comment : LibComment } = require('./lib/src/Comment');

const cors = require('cors');
const corsHandler = cors({ origin: true });

var comments: Record<string, typeof LibComment> = {};

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
      console.log('Failed to sign up user: ' + (error as Error).message);
      res.send({ message: 'Failed to sign up user: ' + (error as Error).message, 
      data: (error as Error).message
    });
  }
  });
});

exports.logInUser = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
  try {
      // Parse user input from the request body
      const email = request.body.email; 
      const password  = request.body.password;
  
      // Call the signUpAPI and await the result
      const apiResult = await login(email, password);

      if (!apiResult) 
      {
        throw new Error("Could not identify user");
      }

      const user: typeof UserEntity = {
        user_id: apiResult.uid,
        user_email: apiResult.email,
        display_name: apiResult.displayName,
        account_creation_time: apiResult.createdAt
      };
  
      // Send a successful response back
      response.status(200).send({ message: 'User signed in successfully', data: user });
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
        const sharing = request.body.sharing;
        const writerId = request.body.writerId;

        const apiResult = await createShareCode(documentId);

        await updateDocumentShareStyle(documentId, sharing, writerId);
    
        // Send a successful response back
        response.status(200).send({ message: 'Here is the share code', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to get documents' + error });
      }
  });
});

exports.getDocumentIdFromShareCode = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
        const shareCode = request.body.shareCode;
        const apiResult = await getDocumentIdFromShareCode(shareCode);
    
        // Send a successful response back
        response.status(200).send({ message: 'Here is the document id', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to get documents' + error });
      }
  });
});

exports.deleteShareCode = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
        const documentId = request.body.documentId; 
        const shareCode = request.body.shareCode;
        await deleteShareCode(documentId, shareCode);

        // Send a successful response back
        response.status(200).send({ message: 'Share Code Deleted', data: true });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to delete share code ' + error, data: error as Error });
      }
  });
});

// preview customization endpoints

exports.updateDocumentEmoji = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
        const {documentId, newEmoji, writerId} = request.body;
        await updateDocumentEmoji(documentId, newEmoji, writerId);
    
        // Send a successful response back
        response.status(200).send({ message: 'Updated document emoji', data: true });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to update document emoji' + error, data: error as Error });
      }
  });
});

exports.updateDocumentColor = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {

      const {documentId, newColor, writerId} = request.body;
      await updateDocumentColor(documentId, newColor, writerId);
    
        // Send a successful response back
        response.status(200).send({ message: 'Updated document color', data: true });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to update document color' + error });
      }
  });
});

exports.updateDocumentFavoritedStatus = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const {documentId, isFavorited, writerId} = request.body;
      
      await updateDocumentFavoritedStatus(documentId, isFavorited as boolean, writerId);
    
        // Send a successful response back
        response.status(200).send({ message: 'Updated document favorited status', data: true });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to update document favorite status', data: error as Error});
      }
  });
});

// CRUD operations endpoints

exports.createDocument = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const userId = request.body.userId;

      const currentDocument = await createDocument(userId);

      response.status(200).send({ message: 'Successfully created new document', data: currentDocument });
      
        // Send a successful response back
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to get documents.', data: error as Error });
      }
  });
});

exports.deleteDocument = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
        const documentId = request.body.documentId;
        const userId = request.body.userId;

        deleteDocument(documentId, userId);
    
        // Send a successful response back
        response.status(200).send({ message: 'Delete document successful', data: true });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to delete document', data: error as Error });
      }
  });
});

var currentDocument = getDefaultDocument();
var userDoc = getDefaultDocument();
var userMap = new Map<string, typeof OnlineEntity>();
var userCursor = getDefaultUser();

exports.checkDocumentChanges = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try 
    {
      const documentChanges = request.body.documentChanges;
      
      if (userDoc != currentDocument)
      {
        userDoc = currentDocument;
      }
      if (documentChanges)
      {
        const documentObject: Record<string,unknown> = JSON.parse(JSON.stringify(documentChanges));
        for (const [key, value] of Object.entries(documentObject)) 
        {
          if (key in userDoc)
          {
            if (typeof value === 'object')
            {
              userDoc[key] = { ...userDoc[key], ...value };
            }
          }
          else
          {
            throw new Error('Invalid key');
          }
        }
      }
      
      // for (se)
      currentDocument = userDoc;
      response.status(200).send({ message: 'Successfully checked document changes', data: {
                                                                                        document: currentDocument,
                                                                                        onlineUsers: Array.from(userMap.values()) }});
    }
    catch (error)
    {
      response.status(500).send({ message: 'Failed to check Document Changes' + error, data: error as Error });
    }
  });
});

exports.subscribeToDocument = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      // var currentDocument = request.body.currentDocument as typeof LibDocument;
      const documentId = request.body.documentId;
      const userId = request.body.userId;
      const user_email = request.body.user_email;
      const displayName = request.body.displayName;

      if (!documentId || !userId) 
      {
        throw new Error('Missing required fields');
      }
      // const email = request.body.email;

      const user = {
        user_email: user_email as string,
        user_id: userId as string,
        display_name: displayName as string
      };
      userMap.set(userId, userCursor);

      await subscribeToDocument(documentId, user, 
        (updatedDocument: typeof LibDocument) => {
          currentDocument = updatedDocument;
          response.status(200).send({ message: 'Successfully subscribed to document', data: {
            document: currentDocument,
            onlineUsers: Array.from(userMap.values())         
      }});
        }, 
      (updateType: typeof UpdateType, onlineEntity: typeof OnlineEntity) => {
        userCursor = onlineEntity;
        switch (updateType) {
          case UpdateType.ADD:
            userMap.set(onlineEntity.user_id, onlineEntity);
            break;
          case UpdateType.CHANGE:
            userMap.set(onlineEntity.user_id, onlineEntity);
            break;
          case UpdateType.REMOVE:
            userMap.delete(onlineEntity.user_id);
            break;
          default:
            break;
        }
      }
      );
      userDoc = currentDocument;
      
      } catch (error) {
      response.status(500).send({ message: 'Failed to subscribe to document ', data: error as Error });
    }
  });
}); // return!!!

exports.updatePartialDocument = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const documentId = request.body.documentId;
      const documentChanges = request.body.documentChanges;
      const writerId = request.body.writerId;
      const documentObject: Record<string,unknown> = JSON.parse(JSON.stringify(documentChanges));

      const apiResult = await updatePartialDocument(documentObject, documentId, writerId);
    
        // Send a successful response back
        response.status(200).send({ message: 'Document has been updated', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to update document ', data: error as Error });
      }
  });
}); // return!!!

// cursor endpoint 

exports.updateUserCursor = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const documentId = request.body.documentId; 
      const userId = request.body.userId;
      const cursor = request.body.cursor;
      
      await updateUserCursor(documentId, {userId, cursor});
    
      // Send a successful response back
      response.status(200).send({ message: 'Updated user cursor', data: Array.from(userMap.values()) });
    } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to update cursor', data: error as Error });
    }
  });
});

// sharing endpoints

exports.updateDocumentShareStyle = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const documentId = request.body.documentId; 
      const sharing = request.body.sharing;
      const writerId = request.body.writerId;
      
      await updateDocumentShareStyle(documentId, sharing, writerId);
        // Send a successful response back
        response.status(200).send({ message: 'Successfully updated share style to ' + ShareStyle[sharing], data: true });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to update document sharing style. ', data: error as Error });
      }
  });
});

exports.shareDocumentWithUser = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const documentId = request.body.documentId;
      const invite_email = request.body.invite_email;
      const sharing = request.body.sharing;
      const writerId = request.body.writerId;

      const userId = getUserIdFromEmail(invite_email);

      await shareDocumentWithUser(documentId, userId, sharing, writerId);
        // Send a successful response back
      response.status(200).send({ message: 'Successfully shared document with ' + userId + ' with ' + ShareStyle[sharing] + ' permissions.', data: true });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to update document sharing style with user. ' + error, data: error as Error });
      }
  });
});

exports.unshareDocumentWithUser = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const {documentId, userId, writerId} = request.body;
      
      await unshareDocumentWithUser(documentId, userId, writerId);
        // Send a successful response back
        response.status(200).send({ message: 'Successfully removed user ' + userId + ' access to document.', data: true });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to update document sharing style with user. ', data: error as Error});
      }
  });
});

exports.updateDocumentTrashedStatus = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const {documentId, is_trashed, writerId} = request.body;
      
      await updateDocumentTrashedStatus(documentId, is_trashed, writerId);
        // Send a successful response back
        response.status(200).send({ message: 'Successfully updated trashed status to ' + is_trashed, data: true });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to update document trashed status. ', data: error as Error});
      }
  });
});

exports.createComment = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const commentText = request.body.commentText;
      const replyId = request.body.replyId;
      const userId = request.body.userId;
      const displayName = request.body.displayName;
      const documentId = request.body.documentId;

      const user = {
        user_id: userId,
        display_name: displayName
      };

      const commentId = await createComment(commentText, replyId, user, documentId);
      
      comments[commentId];
        // Send a successful response back
        response.status(200).send({ message: 'Successfully created new comment.', data: commentId });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Could not create new comment ' + error, data: error as Error});
      }
  });
});

exports.deleteComment = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const commentId = request.body.commentText;
      const documentId = request.body.documentId;
      const userId = request.body.userId;
      
      const apiResult = await deleteComment(commentId, documentId, userId);
        // Send a successful response back
        response.status(200).send({ message: 'Successfully deleted comment.', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to update document sharing style. ' + error });
      }
  });
});

exports.editCommentText = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const newText = request.body.newText;
      const commentId = request.body.commentId;
      const documentId = request.body.documentId;
      const userId = request.body.userId;
            
      await editCommentText(newText, commentId, documentId, userId);
        // Send a successful response back
        response.status(200).send({ message: 'Updated comment to '+ newText, data: true });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to update comment', data: error as Error});
      }
  });
});

exports.subscribeToComments = functions.https.onRequest(async (request: any, response: any) => {
  corsHandler(request, response, async () => {
    try {
      const documentId = request.body.documentId;
      const userId = request.body.userId;  

      await subscribeToComments(documentId, userId, 
        (updateType: typeof UpdateType, comment: typeof LibComment) =>
        { 
          if(updateType === UpdateType.ADD || updateType === UpdateType.CHANGE) {
            comments[comment.comment_id] = comment;
            response.status(200).send({ message: 'Successfully subscribed to comments.', data: comments });
        } else {
            delete comments[comment.comment_id];
        }
        });
        // Send a successful response back
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to subscribe to comments.' + error });
      }
  });
});