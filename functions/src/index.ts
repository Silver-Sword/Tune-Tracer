/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

"use strict";

import { getDocument } from "./backend/src/document-utils/documentOperations";

// [START all]
// [START import]
// The Cloud Functions for Firebase SDK to setup triggers and logging.
const functions = require("firebase-functions/v1");
// const express = require("express");
// const app = express();

const { StatusCode } = require("./backend/src/lib/src/StatusCode");
const { ShareStyle } = require("./backend/src/lib/src/documentProperties");
const {
  Document: LibDocument,
} = require("./backend/src/lib/src/Document");
const { UpdateType } = require("./backend/src/lib/src/UpdateType");
const {
  UserEntity,
} = require("./backend/src/lib/src/UserEntity");
const { Comment: LibComment } = require("./backend/src/lib/src/Comment");
const {  OnlineEntity } = require("./backend/src/lib/src/realtimeUserTypes");

const { signUpAPI, login } = require("./backend/src/endpoints/loginEndpoints");
const {
  createDocument,
} = require("./backend/src/document-utils/documentOperations");
const {
  getAllDocuments,
  getUserDocuments,
  getSharedDocuments,
} = require("./backend/src/endpoints/readEndpoints");
const {
  createShareCode,
  deleteShareCode,
  getDocumentIdFromShareCode,
} = require("./backend/src/document-utils/sharing/sharingUtils");
const {
  getTrashedDocumentPreviews,
} = require("./backend/src/document-utils/documentBatchRead");
const {
  updateDocumentEmoji,
  updateDocumentColor,
  updateDocumentFavoritedStatus,
} = require("./backend/src/document-utils/updateUserLevelDocumentProperties");
const {
  subscribeToDocument,
} = require("./backend/src/document-utils/realtimeDocumentUpdates");
const {
  updateUserCursor,
} = require("./backend/src/document-utils/realtimeOnlineUsers");
const {
  updateDocumentShareStyle,
  updateDocumentTrashedStatus,
} = require("./backend/src/document-utils/updateDocumentMetadata");
const {
  shareDocumentWithUser,
  unshareDocumentWithUser,
} = require("./backend/src/document-utils/updateDocumentMetadata");
const {
  updatePartialDocument,
  deleteDocument,
} = require("./backend/src/document-utils/documentOperations");
const {
  createComment,
  deleteComment,
  editCommentText,
  subscribeToComments,
} = require("./backend/src/comment-utils/commentOperations");
const { 
  getUserIdFromEmail,
  getUserFromId
} = require("./backend/src/user-utils/getUserData");
const {
  getUserAccessLevel,
} = require("./backend/src/security-utils/getUserAccessLevel");

const cors = require("cors");
const corsHandler = cors({ origin: true });

var comments: Record<string, typeof LibComment> = {};

exports.signUpUser = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      // Parse user input from the request body
      // if (!req.body)
      // {
      //   throw new Error('Missing any inputs');
      // }

      const email: string = req.body.email;
      const password: string = req.body.password;
      const displayName: string = req.body.displayName;

      if (!email || !password || !displayName) {
        res
          .status(StatusCode.MISSING_ARGUMENTS)
          .send({ message: "Missing required fields" });
      } else {
        // Call the signUpAPI and await the result
        const apiResult = await signUpAPI(email, password, displayName);

        res.status(StatusCode.OK).send({
          message: "User signed up successfully",
          data: apiResult,
        });
      }
    } catch (error) {
      // Send an error response if something goes wrong
      console.log("Failed to sign up user: " + (error as Error).message);
      res.status(StatusCode.GENERAL_ERROR).send({
        message: "Failed to sign up user: " + (error as Error).message,
        data: (error as Error).message,
      });
    }
  });
});

exports.logInUser = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        // Parse user input from the request body
        const email = request.body.email;
        const password = request.body.password;
        if (!email || !password) {
          response
            .status(StatusCode.MISSING_ARGUMENTS)
            .send({ message: "Missing required fields" });
        } else {
          // Call the signUpAPI and await the result
          const apiResult = await login(email, password);

          if (!apiResult) {
            throw new Error("Could not identify user");
          }

          const user: typeof UserEntity = {
            user_id: apiResult.uid,
            user_email: apiResult.email,
            display_name: apiResult.displayName,
            account_creation_time: apiResult.createdAt,
          };

          // Send a successful response back
          response
            .status(StatusCode.OK)
            .send({ message: "User signed in successfully", data: user });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response
          .status(StatusCode.GENERAL_ERROR)
          .send({ message: "Failed to log in user", data: error as Error });
      }
    });
  }
);

// document preview endpoints

exports.getAllPreviews = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const userId = request.body.userId;
        if (!userId) {
          response
            .status(StatusCode.MISSING_ARGUMENTS)
            .send({ message: "Missing required fields: userId" });
        } else {
          const apiResult = await getAllDocuments(userId);

          // Send a successful response back
          response
            .status(StatusCode.OK)
            .send({ message: "Here are all the documents", data: apiResult });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response
          .status(StatusCode.GENERAL_ERROR)
          .send({
            message: "Error: Failed to get documents",
            data: error as Error,
          });
      }
    });
  }
);

exports.getOwnedPreviews = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const userId = request.body.userId;
        if (!userId) {
          response
            .status(StatusCode.MISSING_ARGUMENTS)
            .send({ message: "Missing required fields: userId" });
        } else {
          const apiResult = await getUserDocuments(userId);

          // Send a successful response back
          response.status(StatusCode.OK).send({
            message: "Successful retrieval of documents",
            data: apiResult,
          });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response
          .status(StatusCode.GENERAL_ERROR)
          .send({ message: "Failed to get documents", data: error as Error });
      }
    });
  }
);

exports.getSharedPreviews = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const userId = request.body.userId;
        if (!userId) {
          response
            .status(StatusCode.MISSING_ARGUMENTS)
            .send({ message: "Missing required fields: userId" });
        } else {
          const apiResult = await getSharedDocuments(userId);

          // Send a successful response back
          response.status(StatusCode.OK).send({
            message: "Successful retrieval of documents",
            data: apiResult,
          });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response
          .status(StatusCode.GENERAL_ERROR)
          .send({ message: "Failed to get documents", data: error as Error });
      }
    });
  }
);

exports.getTrashedDocumentPreviews = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const userId = request.body.userId;
        if (!userId) {
          response
            .status(StatusCode.MISSING_ARGUMENTS)
            .send({ message: "Missing required fields: userId" });
        } else {
          const apiResult = await getTrashedDocumentPreviews(userId);

          // Send a successful response back
          response
            .status(StatusCode.OK)
            .send({ message: "Here are all the documents", data: apiResult });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response
          .status(StatusCode.GENERAL_ERROR)
          .send({ message: "Failed to get documents", data: error as Error });
      }
    });
  }
);

exports.getUserFromId = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const userId = request.body.userId;
        if (!userId) {
          response
            .status(StatusCode.MISSING_ARGUMENTS)
            .send({ message: "Missing required fields: userId" });
        } else {
          const apiResult = await getUserFromId(userId);
          if(apiResult === null) {
            response.status(StatusCode.USER_NOT_FOUND).send({
              message: `User with id ${userId} not found in the database`,
            });
          } else {
            // Send a successful response back
            response
              .status(StatusCode.OK)
              .send({ message: "Here is the user", data: apiResult });
          }
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response
          .status(StatusCode.GENERAL_ERROR)
          .send({ message: "Failed to get user", data: error as Error });
      }
    });
  }
);

// share code endpoints

exports.createShareCode = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const documentId = request.body.documentId;
        const sharing = request.body.sharing;
        const writerId = request.body.writerId;

        if (!documentId || !sharing || !writerId) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required field: ${
              !documentId ? "documentId" : !sharing ? "sharing" : "writerId"
            }`,
          });
        } else {
          const apiResult = await createShareCode(documentId);

          await updateDocumentShareStyle(documentId, sharing, writerId);

          // Send a successful response back
          response
            .status(StatusCode.OK)
            .send({ message: "Here is the share code", data: apiResult });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response
          .status(StatusCode.GENERAL_ERROR)
          .send({ message: "Failed to get share code", data: error as Error });
      }
    });
  }
);

exports.getDocumentIdFromShareCode = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const shareCode = request.body.shareCode;
        if (!shareCode) {
          response
            .status(StatusCode.MISSING_ARGUMENTS)
            .send({ message: "Missing required field: shareCode" });
        } else {
          const apiResult = await getDocumentIdFromShareCode(shareCode);

          // Send a successful response back
          response
            .status(StatusCode.OK)
            .send({ message: "Here is the document id", data: apiResult });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response
          .status(StatusCode.GENERAL_ERROR)
          .send({ message: "Failed to get documents", data: error as Error });
      }
    });
  }
);

exports.deleteShareCode = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const documentId = request.body.documentId;
        const shareCode = request.body.shareCode;
        if (!documentId || !shareCode) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required field: ${
              !documentId ? "documentId" : "shareCode"
            }`,
          });
        } else {
          await deleteShareCode(documentId, shareCode);

          // Send a successful response back
          response
            .status(StatusCode.OK)
            .send({ message: "Share Code Deleted", data: true });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(StatusCode.GENERAL_ERROR).send({
          message: "Failed to delete share code",
          data: error as Error,
        });
      }
    });
  }
);

// preview customization endpoints

exports.updateDocumentEmoji = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const { documentId, newEmoji, writerId } = request.body;
        if (!documentId || !newEmoji || !writerId) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required field: ${
              !documentId ? "documentId" : !newEmoji ? "newEmoji" : "writerId"
            }`,
          });
        } else {
          await updateDocumentEmoji(documentId, newEmoji, writerId);

          // Send a successful response back
          response
            .status(StatusCode.OK)
            .send({ message: "Updated document emoji", data: true });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(StatusCode.GENERAL_ERROR).send({
          message: "Failed to update document emoji",
          data: error as Error,
        });
      }
    });
  }
);

exports.updateDocumentColor = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const { documentId, newColor, writerId } = request.body;
        if (!documentId || !newColor || !writerId) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required field: ${
              !documentId ? "documentId" : !newColor ? "newColor" : "writerId"
            }`,
          });
        } else {
          await updateDocumentColor(documentId, newColor, writerId);

          // Send a successful response back
          response
            .status(StatusCode.OK)
            .send({ message: "Updated document color", data: true });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response
          .status(StatusCode.GENERAL_ERROR)
          .send({
            message: "Failed to update document color",
            data: error as Error,
          });
      }
    });
  }
);

exports.updateDocumentFavoritedStatus = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const { documentId, isFavorited, writerId } = request.body;
        if (!documentId || isFavorited === undefined || !writerId) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required field: ${
              !documentId
                ? "documentId"
                : isFavorited === undefined
                ? "isFavorited"
                : "writerId"
            }`,
          });
        } else {
          await updateDocumentFavoritedStatus(
            documentId,
            isFavorited as boolean,
            writerId
          );

          // Send a successful response back
          response
            .status(StatusCode.OK)
            .send({ message: "Updated document favorited status", data: true });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(StatusCode.GENERAL_ERROR).send({
          message: "Failed to update document favorite status",
          data: error as Error,
        });
      }
    });
  }
);

// CRUD operations endpoints

exports.createDocument = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const userId = request.body.userId;
        if (!userId) {
          response
            .status(StatusCode.MISSING_ARGUMENTS)
            .send({ message: "Missing required fields: userId" });
        } else {
          const currentDocument = await createDocument(userId);

          response.status(StatusCode.OK).send({
            message: "Successfully created new document",
            data: currentDocument,
          });
        }

        // Send a successful response back
      } catch (error) {
        // Send an error response if something goes wrong
        response
          .status(StatusCode.GENERAL_ERROR)
          .send({ message: "Failed to get documents.", data: error as Error });
      }
    });
  }
);

exports.deleteDocument = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const documentId = request.body.documentId;
        const userId = request.body.userId;
        if (!documentId || !userId) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required field: ${
              !documentId ? "documentId" : "userId"
            }`,
          });
        } else {
          await deleteDocument(documentId, userId);

          // Send a successful response back
          response
            .status(StatusCode.OK)
            .send({ message: "Delete document successful", data: true });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response
          .status(StatusCode.GENERAL_ERROR)
          .send({ message: "Failed to delete document", data: error as Error });
      }
    });
  }
);

var documentMap = new Map<string, typeof LibDocument>();
var userMap = new Map<string, Map<string, typeof OnlineEntity>>();

function updateDocumentMap(documentId: string, document: typeof LibDocument) {
  const oldDocument = documentMap.get(documentId);

  if(oldDocument === undefined || oldDocument.metadata.last_modified_time < document.metadata.last_modified_time) {
    documentMap.set(documentId, document);
  }
}

async function getDocumentFromMap(documentId: string, userId: string) {
  if(!documentMap.has(documentId)) {
    const doc = await getDocument(documentId, userId);
    documentMap.set(documentId, doc);
  }
  return documentMap.get(documentId);
}

function updateUserMap(
  documentId: string,
  onlineEntity: typeof OnlineEntity,
  isRemove: boolean
) {
  if(!userMap.has(documentId)) {
    userMap.set(documentId, new Map<string, typeof OnlineEntity>());
  }

  if (isRemove) {
    userMap.get(documentId)?.delete(onlineEntity.user_id);
  } else {
    userMap.get(documentId)?.set(onlineEntity.user_id, onlineEntity);
  }
}

// assumes that subscribeToDocument is called first
exports.checkDocumentChanges = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const documentId = request.body.documentId;
        const writerId = request.body.writerId;
        const documentChanges = request.body.documentChanges;
        if (!documentId || !writerId) {
          response
            .status(StatusCode.MISSING_ARGUMENTS)
            .send({
              message: `Missing required field: ${
                !documentId ? "documentId" : "writerId"
              }`,
            });
        } else {

          if (documentChanges) {
            const documentObject: Record<string, unknown> = JSON.parse(
              JSON.stringify(documentChanges)
            );
            const userDoc = documentMap.get(documentId);
            if(userDoc === undefined) {
              throw new Error("Document does not exist");
            }
            for (const [key, value] of Object.entries(documentObject)) {
              if (key in userDoc) {
                if (typeof value === "object") {
                  userDoc[key] = { ...userDoc[key], ...value };
                  // await updatePartialDocument(userDoc[key], documentId, writerId);
                } else if (key === "document_title") {
                  userDoc[key] = value;
                  // await updatePartialDocument(userDoc[key], documentId, writerId);
                } else {
                  throw new Error("Invalid key");
                }
              }
            }
            // const documentObject: Record<string,unknown> = currentDocument as Record<string,unknown>;
            await updatePartialDocument(documentObject, documentId, writerId);
          }

          // for (se)
          // documentMap.set(documentId, currentDocument);
          response.status(StatusCode.OK).send({
            message: "Successfully checked document changes",
            data: {
              document: await getDocumentFromMap(documentId, writerId), 
              onlineUsers: Array.from(userMap.values()),
            },
          });
        }
      } catch (error) {
        response.status(StatusCode.GENERAL_ERROR).send({
          message: "Failed to check Document Changes",
          data: error as Error,
        });
      }
    });
  }
);

exports.subscribeToDocument = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {;
        const documentId = request.body.documentId;
        const userId = request.body.userId;
        const user_email = request.body.user_email;
        const displayName = request.body.displayName;

        if (!documentId || !userId || !user_email || !displayName) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required fields: ${
              !documentId
                ? "documentId"
                : !userId
                ? "userId"
                : !user_email
                ? "user_email"
                : "displayName"
            }`,
          });
        } else {
          // const email = request.body.email;

          const user = {
            user_email: user_email as string,
            user_id: userId as string,
            display_name: displayName as string,
          };

          await subscribeToDocument(
            documentId,
            user,
            (updatedDocument: typeof LibDocument) => {
              updateDocumentMap(documentId, updatedDocument);
            },
            (
              updateType: typeof UpdateType,
              onlineEntity: typeof OnlineEntity
            ) => {
              switch (updateType) {
                case UpdateType.ADD:
                  updateUserMap(documentId, onlineEntity, false);
                  break;
                case UpdateType.CHANGE:
                  updateUserMap(documentId, onlineEntity, false);
                  break;
                case UpdateType.REMOVE:
                  updateUserMap(documentId, onlineEntity, true);
                  break;
                  default:
                    break;
              }
            }
          );

          response.status(StatusCode.OK).send({
            message: "Successfully subscribed to document",
            data: {
              document: await getDocumentFromMap(documentId, userId),
              onlineUsers: Array.from(userMap.values()),
            },
          });
        }
      } catch (error) {
        response.status(StatusCode.GENERAL_ERROR).send({
          message: "Failed to subscribe to document ",
          data: error as Error,
        });
      }
    });
  }
); // return!!!

exports.updatePartialDocument = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const documentId = request.body.documentId;
        const documentChanges = request.body.documentChanges;
        const writerId = request.body.writerId;
        if (!documentId || !documentChanges || !writerId) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required field: ${
              !documentId
                ? "documentId"
                : !documentChanges
                ? "documentChanges"
                : "writerId"
            }`,
          });
        } else {
          const documentObject: Record<string, unknown> = JSON.parse(
            JSON.stringify(documentChanges)
          );

          const apiResult = await updatePartialDocument(
            documentObject,
            documentId,
            writerId
          );
          // Send a successful response back
          response
            .status(StatusCode.OK)
            .send({ message: "Document has been updated", data: apiResult });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(StatusCode.GENERAL_ERROR).send({
          message: "Failed to update document",
          data: error as Error,
        });
      }
    });
  }
); // return!!!

// cursor endpoint

exports.updateUserCursor = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const documentId = request.body.documentId;
        const userId = request.body.userId;
        const cursor = request.body.cursor;
        if (!documentId || !userId) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required field: ${
              !documentId ? "documentId" : "userId"
            }`,
          });
        } else {
          await updateUserCursor(documentId, { userId, cursor });

          // Send a successful response back
          response.status(StatusCode.OK).send({
            message: "Updated user cursor",
            data: Array.from(userMap.values()),
          });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response
          .status(StatusCode.GENERAL_ERROR)
          .send({ message: "Failed to update cursor", data: error as Error });
      }
    });
  }
);

// sharing endpoints

exports.updateDocumentShareStyle = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const documentId = request.body.documentId;
        const sharing = request.body.sharing;
        const writerId = request.body.writerId;
        if (!documentId || !sharing || !writerId) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required field: ${
              !documentId ? "documentId" : !sharing ? "sharing" : "writerId"
            }`,
          });
        } else {
          await updateDocumentShareStyle(documentId, sharing, writerId);
          // Send a successful response back
          response.status(StatusCode.OK).send({
            message:
              "Successfully updated share style to " + ShareStyle[sharing],
            data: true,
          });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(StatusCode.GENERAL_ERROR).send({
          message: "Failed to update document sharing style. ",
          data: error as Error,
        });
      }
    });
  }
);

exports.shareDocumentWithUser = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const documentId = request.body.documentId;
        const invite_email = request.body.invite_email;
        const sharing: number = request.body.sharing;
        const writerId: string = request.body.writerId;
        if (!documentId || !invite_email || !sharing || !writerId) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required field: ${
              !documentId
                ? "documentId"
                : !invite_email
                ? "invite_email"
                : !sharing
                ? "sharing"
                : "writerId"
            }`,
          });
        } else {
          const userId = await getUserIdFromEmail(invite_email);

          if(userId === null) {
            response.status(StatusCode.USER_NOT_FOUND).send({
              message: `User with email ${invite_email} not found in the database`,
            });
          } else {
            await shareDocumentWithUser(documentId, userId, sharing, writerId);
            // Send a successful response back
            response.status(StatusCode.OK).send({
              message:
                "Successfully shared document with " +
                userId +
                " with " +
                ShareStyle[sharing] +
                " permissions.",
              data: true,
            });
          }
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(StatusCode.GENERAL_ERROR).send({
          message: "Failed to update document sharing style with user.",
          data: error as Error,
        });
      }
    });
  }
);

exports.unshareDocumentWithUser = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const { documentId, userId, writerId } = request.body;
        if (!documentId || !userId || !writerId) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required field: ${
              !documentId ? "documentId" : !userId ? "userId" : "writerId"
            }`,
          });
        } else {
          await unshareDocumentWithUser(documentId, userId, writerId);
          // Send a successful response back
          response.status(StatusCode.OK).send({
            message:
              "Successfully removed user " + userId + " access to document.",
            data: true,
          });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(StatusCode.GENERAL_ERROR).send({
          message: "Failed to update document sharing style with user. ",
          data: error as Error,
        });
      }
    });
  }
);

exports.updateDocumentTrashedStatus = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const { documentId, is_trashed, writerId } = request.body;
        if (!documentId || is_trashed === undefined || !writerId) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required field: ${
              !documentId
                ? "documentId"
                : is_trashed === undefined
                ? "is_trashed"
                : "writerId"
            }`,
          });
        } else {
          await updateDocumentTrashedStatus(documentId, is_trashed, writerId);
          // Send a successful response back
          response.status(StatusCode.OK).send({
            message: "Successfully updated trashed status to " + is_trashed,
            data: true,
          });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(StatusCode.GENERAL_ERROR).send({
          message: "Failed to update document trashed status. ",
          data: error as Error,
        });
      }
    });
  }
);

exports.createComment = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const commentText = request.body.commentText;
        const replyId = request.body.replyId;
        const userId = request.body.userId;
        const displayName = request.body.displayName;
        const documentId = request.body.documentId;
        if (!commentText || !userId || !displayName || !documentId) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required field: ${
              !commentText
                ? "commentText"
                : !userId
                ? "userId"
                : !displayName
                ? "displayName"
                : "documentId"
            }`,
          });
        } else {
          const user = {
            user_id: userId,
            display_name: displayName,
          };

          const commentId = await createComment(
            commentText,
            replyId,
            user,
            documentId
          );

          comments[commentId];
          // Send a successful response back
          response.status(StatusCode.OK).send({
            message: "Successfully created new comment.",
            data: commentId,
          });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(StatusCode.GENERAL_ERROR).send({
          message: "Could not create new comment",
          data: error as Error,
        });
      }
    });
  }
);

exports.deleteComment = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const commentId = request.body.commentText;
        const documentId = request.body.documentId;
        const userId = request.body.userId;
        if (!commentId || !documentId || !userId) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required field: ${
              !commentId ? "commentId" : !documentId ? "documentId" : "userId"
            }`,
          });
        } else {
          const apiResult = await deleteComment(commentId, documentId, userId);
          // Send a successful response back
          response.status(StatusCode.OK).send({
            message: "Successfully deleted comment.",
            data: apiResult,
          });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(StatusCode.GENERAL_ERROR).send({
          message: "Failed to update document sharing style.",
          data: error as Error,
        });
      }
    });
  }
);

exports.editCommentText = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const newText = request.body.newText;
        const commentId = request.body.commentId;
        const documentId = request.body.documentId;
        const userId = request.body.userId;
        if (newText === undefined || !commentId || !documentId || !userId) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required field: ${
              newText === undefined
                ? "newText"
                : !commentId
                ? "commentId"
                : !documentId
                ? "documentId"
                : "userId"
            }`,
          });
        } else {
          await editCommentText(newText, commentId, documentId, userId);
          // Send a successful response back
          response
            .status(StatusCode.OK)
            .send({ message: "Updated comment to " + newText, data: true });
        }
      } catch (error) {
        // Send an error response if something goes wrong
        response
          .status(StatusCode.GENERAL_ERROR)
          .send({ message: "Failed to update comment", data: error as Error });
      }
    });
  }
);

exports.subscribeToComments = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const documentId = request.body.documentId;
        const userId = request.body.userId;
        if (!documentId || !userId) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required field: ${
              !documentId ? "documentId" : "userId"
            }`,
          });
        } else {
          await subscribeToComments(
            documentId,
            userId,
            (updateType: typeof UpdateType, comment: typeof LibComment) => {
              if (
                updateType === UpdateType.ADD ||
                updateType === UpdateType.CHANGE
              ) {
                comments[comment.comment_id] = comment;
                response.status(StatusCode.OK).send({
                  message: "Successfully subscribed to comments.",
                  data: comments,
                });
              } else {
                delete comments[comment.comment_id];
              }
            }
          );
        }
        // Send a successful response back
      } catch (error) {
        // Send an error response if something goes wrong
        response
          .status(StatusCode.GENERAL_ERROR)
          .send({
            message: "Failed to subscribe to comments.",
            data: error as Error,
          });
      }
    });
  }
);

exports.getUserAccessLevel = functions.https.onRequest(
  async (request: any, response: any) => {
    corsHandler(request, response, async () => {
      try {
        const userId = request.body.userId;
        const documentId = request.body.documentId;
        if (!userId || !documentId) {
          response.status(StatusCode.MISSING_ARGUMENTS).send({
            message: `Missing required field: ${
              !userId ? "userId" : "documentId"
            }`,
          });
        } else {
          const apiResult = await getUserAccessLevel(userId, documentId);
          response.status(StatusCode.OK).send({
            message: "The highest user access level is " + apiResult,
            data: apiResult,
          });
        }
        // Send a successful response back
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(StatusCode.GENERAL_ERROR).send({
          message: "Failed to get highest user access level.",
          data: error as Error,
        });
      }
    });
  }
);
