import { getUserID, getDocumentID } from "../../cookie";
import { callAPI } from "../../../utils/callAPI";

export const createShareCode = async (accessLevel: "Viewer" | "Editor") => {
  const sharing = accessLevel === "Viewer" ? 2 : 4;
  const param = {
    documentId: getDocumentID(),
    sharing: sharing,
    writerId: getUserID(),
  };

  return callAPI("createShareCode", param);
};
