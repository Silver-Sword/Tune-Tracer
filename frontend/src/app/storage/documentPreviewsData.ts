import { callAPI } from "../../utils/callAPI";
import { DocumentPreview } from "../lib/src/documentProperties";

export async function getOwnPreviews(userId: string): Promise<DocumentPreview[]> {
  const userInfo2 = {
    userId: userId,
  };
  const response = await callAPI("getOwnedPreviews", userInfo2);
  if (response.status == 200) {
    console.log(response.data);
    return response.data as DocumentPreview[];
  }
  return [];
}

export async function getSharedPreviews(userId: string): Promise<DocumentPreview[]> {
  const userInfo = {
    userId: userId,
  };
  const response = await callAPI("getSharedPreviews", userInfo);
  if (response.status == 200) {
    return response.data as DocumentPreview[];
  }
  return [];
}
