import { OnlineEntity } from "./backend/src/lib/src/realtimeUserTypes";
import { Document } from "./backend/src/lib/src/Document";
import { UpdateType } from "./backend/src/lib/src/UpdateType";
import { admin_subscribeToDocument } from "./backend/src/document-utils/realtimeDocumentUpdates";
import { getDocument } from "./backend/src/document-utils/documentOperations";
import { getUserPool } from "./backend/src/document-utils/realtimeOnlineUsers";

type DocumentMapData = {
  document: Document | undefined;
  onlineUsers: Record<string, OnlineEntity> | undefined;
  isServerSubscribed: boolean;
};

const documentDataMap: Record<string, DocumentMapData> = {};
const SERVER_ID = Date.now() % 1000;

export function getServerId() {
  return SERVER_ID;
}

export async function ensureMapData(
  documentId: string,
  isAlreadySubscribed: boolean = false
) {
  if (!documentDataMap[documentId]) {
    documentDataMap[documentId] = {
      document: undefined,
      onlineUsers: undefined,
      isServerSubscribed: isAlreadySubscribed,
    };
  }

  if (!documentDataMap[documentId].document) {
    documentDataMap[documentId].document = await getDocument(
      documentId,
      "server"
    );
  }
  if (!documentDataMap[documentId].onlineUsers) {
    const currentPool: OnlineEntity[] = await getUserPool(documentId);
    documentDataMap[documentId].onlineUsers = currentPool.reduce(
      (acc: Record<string, OnlineEntity>, onlineEntity: OnlineEntity) => {
        if (onlineEntity.user_id) {
          acc[onlineEntity.user_id] = onlineEntity;
        }
        return acc;
      },
      {}
    );
  }
  if (!documentDataMap[documentId].isServerSubscribed) {
    await subscribeServerToDocument(documentId);
    documentDataMap[documentId].isServerSubscribed = true;
  }
}

export async function genUpdateDocumentMap(
  documentId: string,
  document: Document
) {
  await ensureMapData(documentId);
  const oldDocument = documentDataMap[documentId].document;

  if (
    oldDocument === undefined ||
    oldDocument.metadata.last_edit_time < document.metadata.last_edit_time
  ) {
    documentDataMap[documentId].document = document;
    console.log(
      `Server id ${SERVER_ID} updated document ${documentId} with LET ${document.metadata.last_edit_time}`
    );
  }
}

export async function genDocumentFromMap(documentId: string, userId: string) {
  await ensureMapData(documentId);

  if (!documentDataMap[documentId].document) {
    const doc = await getDocument(documentId, userId);
    await genUpdateDocumentMap(documentId, doc);
  }

  console.log(
    `Server id ${SERVER_ID} received document ${documentId} with LET ${
      documentDataMap[documentId]?.document?.metadata.last_edit_time ?? "undefined"
    }`
  );
  return documentDataMap[documentId].document;
}

export async function genUsersFromMap(documentId: string) {
  await ensureMapData(documentId);
  const users = documentDataMap[documentId]?.onlineUsers ?? {};
  if ("undefined" in users) {
    delete users["undefined"];
  }
  console.log(
    `Server id ${SERVER_ID} served users for document ${documentId}; Data: ${JSON.stringify(
      users
    )}`
  );
  return users;
}

export async function genUpdateUserMap(
  documentId: string,
  onlineEntity: OnlineEntity,
  isRemove: boolean
) {
  if (onlineEntity === undefined || onlineEntity.user_id === undefined) {
    console.error(
      `Invalid online entity: ${
        onlineEntity ? JSON.stringify(onlineEntity) : "undefined"
      }`
    );
    return;
  }

  await ensureMapData(documentId);
  const users = documentDataMap[documentId].onlineUsers as Record<
    string,
    OnlineEntity
  >;
  if (isRemove) {
    delete users[onlineEntity.user_id];
  } else {
    const oldOnlineEntity = users[onlineEntity.user_id];
    if (
      oldOnlineEntity === undefined ||
      oldOnlineEntity.last_active_time < onlineEntity.last_active_time
    ) {
      console.log(
        `Server id ${SERVER_ID} updated user ${
          onlineEntity.user_id
        } for document ${documentId}; Data: ${JSON.stringify(onlineEntity)}`
      );
      users[onlineEntity.user_id] = onlineEntity;
    }
  }
}

export async function subscribeServerToDocument(documentId: string) {
  console.info(`Server id ${SERVER_ID} subscribing to document ${documentId}`);
  await admin_subscribeToDocument(
    documentId,
    (updatedDocument: Document) => {
      genUpdateDocumentMap(documentId, updatedDocument);
    },
    (updateType: UpdateType, onlineEntity: OnlineEntity) => {
      genUpdateUserMap(documentId, onlineEntity, updateType === UpdateType.DELETE);
    }
  );
}
