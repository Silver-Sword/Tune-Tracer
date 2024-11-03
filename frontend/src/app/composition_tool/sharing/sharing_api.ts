import { getUserID } from "../../cookie";
import { callAPI } from "../../../utils/callAPI";
import { ShareStyle } from "../../lib/src/documentProperties";

export const createShareCode = async (accessLevel: "Viewer" | "Editor", documentId: string) => {
  const sharing = accessLevel === "Viewer" ? ShareStyle.READ : ShareStyle.WRITE;
  const param = {
    documentId: documentId,
    sharing: sharing,
    writerId: getUserID(),
  };

  return callAPI("createShareCode", param);
};

export const updateDocumentShareStyle = async (accessType: "restricted" | "anyone", accessLevel: "Viewer" | "Editor", documentId: string) => {
  const sharing = accessType === "restricted" ? ShareStyle.NONE : (accessLevel === "Viewer" ? ShareStyle.READ : ShareStyle.WRITE);
  const param = {
    documentId: documentId,
    sharing: sharing,
    writerId: getUserID(),
  };

  return callAPI("updateDocumentShareStyle", param);
};