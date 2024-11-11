import { callAPI } from "../../utils/callAPI";
import { DocumentData } from "./DocCard";

export async function getOwnPreviews(userId: string): Promise<DocumentData[]> {
  const userInfo2 = {
    userId: userId,
  };
  const response = await callAPI("getOwnedPreviews", userInfo2);
  if (response.status == 200) {
    console.log(response.data);
    return response.data as DocumentData[];
  }
  return [];
}

export async function getSharedPreviews(userId: string): Promise<DocumentData[]> {
  const userInfo = {
    userId: userId,
  };
  const response = await callAPI("getSharedPreviews", userInfo);
  if (response.status == 200) {
    return response.data as DocumentData[];
  }
  return [];
}
