import { getUserID } from "../../cookie";
import { callAPI } from "../../../utils/callAPI";
import { ShareStyle } from "../../lib/src/documentProperties";
import { Collaborator } from "./sharing_types";

export const createShareCode = async (
  accessLevel: "Viewer" | "Editor",
  documentId: string
) => {
  const sharing = accessLevel === "Viewer" ? ShareStyle.READ : ShareStyle.WRITE;
  const param = {
    documentId: documentId,
    sharing: sharing,
    writerId: getUserID(),
  };

  return callAPI("createShareCode", param);
};

export const updateDocumentShareStyle = async (
  accessType: "restricted" | "anyone",
  accessLevel: "Viewer" | "Editor",
  documentId: string
) => {
  const sharing =
    accessType === "restricted"
      ? ShareStyle.NONE
      : accessLevel === "Viewer"
      ? ShareStyle.READ
      : ShareStyle.WRITE;
  const param = {
    documentId: documentId,
    sharing: sharing,
    writerId: getUserID(),
  };

  return callAPI("updateDocumentShareStyle", param);
};

export const upsertCollaborator = async (
  email: string,
  documentId: string,
  role: "Viewer" | "Editor"
) => {
  const param = {
    documentId: documentId,
    invite_email: email,
    sharing: role === "Viewer" ? ShareStyle.READ : ShareStyle.WRITE,
    writerId: getUserID(),
  };

  return callAPI("shareDocumentWithUser", param);
};

export const removeCollaborator = async (
  userIdForRemoval: string,
  documentId: string
) => {
  const param = {
    documentId: documentId,
    userId: userIdForRemoval,
    writerId: getUserID(),
  };

  return callAPI("unshareDocumentWithUser", param);
};

export const getUserDetails = async (
  userId: string
): Promise<{ name: string; email: string } | null> => {
  const response = await callAPI("getUserFromId", { userId: userId });
  if (response.status === 200) {
    const userData = response.data as any;
    return {
      name: userData.display_name,
      email: userData.user_email,
    };
  } else {
    console.error("Error getting user details", response);
    return null;
  }
};
