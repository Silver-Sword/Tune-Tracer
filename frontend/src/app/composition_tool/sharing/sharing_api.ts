import { getUserID, getDocumentID } from "../../cookie";
import { callAPI } from "../../../utils/callAPI";
import { ShareStyle } from "../../lib/src/documentProperties";

export const createShareCode = async (accessLevel: "Viewer" | "Editor") => {
  const sharing = accessLevel === "Viewer" ? ShareStyle.READ : ShareStyle.WRITE;
  const param = {
    documentId: getDocumentID(),
    sharing: sharing,
    writerId: getUserID(),
  };

  return callAPI("createShareCode", param);
};
