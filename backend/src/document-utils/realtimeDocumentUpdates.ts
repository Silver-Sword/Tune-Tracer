import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { Document } from "@lib/documentTypes";

// takes in the documentId and a function that is called whenever the document is updated in firebase
// the onUpdateFn function takes in the updated document and is intended to be used to update the local
// document version (ie use this updated document)
export async function subscribeToDocumentUpdates(
  documentId: string,
  onUpdateFn: (updatedDocument: Document) => void
) {
  const firebase = new FirebaseWrapper();
  firebase.initApp();

  firebase.subscribeToDocument(documentId, (snapshot) => {
    if (
      snapshot.exists &&
      snapshot.data() !== null &&
      snapshot.data() !== undefined
    ) {
      onUpdateFn(snapshot.data() as Document);
    }
  });
}
