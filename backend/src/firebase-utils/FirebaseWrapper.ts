import firebase from 'firebase/compat/app'
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { FIREBASE_CONFIG, DOCUMENT_DATABASE_NAME } from '../firebaseSecrets'
import { DocumentMetadata, FirebaseDocumentData } from '../document-utils/documentTypes';

/*
    Wrapper class for doing firebase stuff
    Remember to call .initApp() before doing anything
    Note, all functions are async, so any returns are promises
*/
export default class FirebaseWrapper
{
    public initApp(): void
    {
        if (firebase.apps.length === 0) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
    }

    async signUpNewUser(email: string, password: string, displayName: string): Promise<boolean>
    {
        try {
            // user sign up
            await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = firebase.auth().currentUser;
            if(!user)
            {
                throw Error('Something went wrong with user signup. User is null');
            }
    
            // update username
            await user.updateProfile({
                displayName : displayName
            });
        } catch(error) {
            console.log("Error creating user: ", (error as Error).message);
            return false;
        }

        return true;
    }

    // will throw an error on a failed sign in
    async signInUser(email: string, password: string) : Promise<void>
    {
        await firebase.auth().signInWithEmailAndPassword(email, password);
    }

    async doesDocumentExist(documentId: string): Promise<boolean>
    {
        return (await firebase.firestore()
                      .collection(DOCUMENT_DATABASE_NAME)
                      .doc(documentId)
                      .get()).exists;
    }

    // creates a blank composition document and returns the id of the created document
    async createDocument(): Promise<string>
    {
        const firestoreDocument = await firebase
            .firestore()
            .collection(DOCUMENT_DATABASE_NAME)
            .add({});  
        return firestoreDocument.id;
    }

    // takes in the new document
    // returns true iff the document exists and the update was successful
    async updateDocument(documentId: string, firebaseDocument: FirebaseDocumentData): Promise<boolean>
    {
        if(!await this.doesDocumentExist(documentId))
        {
            return false;
        }
        await firebase.firestore()
                      .collection(DOCUMENT_DATABASE_NAME)
                      .doc(documentId)
                      .update({
                        "documentString" : firebaseDocument.documentString,
                        "metadata": firebaseDocument.metadata,
                      });
        return true;
    }

    // takes in the document unique id and returns the associated document as a JSON object
    // if the document or data doesn't exist, the function returns null
    async getDocument(documentId: string): Promise<FirebaseDocumentData | null>
    {
        const document = (await firebase.firestore()
            .collection(DOCUMENT_DATABASE_NAME)
            .doc(documentId)
            .get());
        
        if(!document.exists)
        {
            return null;
        } 

        const data = document.data();
        if(data === undefined || !('documentString' in data) || !("metadata" in data))
        {
            return null;
        }
        
        return {
            documentString: data['documentString'],
            metadata: data['metadata']
        } as FirebaseDocumentData;
    }

    async getDocumentField(documentId: string, field: string): Promise<string | null> {
        const document = (await firebase.firestore()
            .collection(DOCUMENT_DATABASE_NAME)
            .doc(documentId)
            .get());
        
        if(!document.exists)
        {
            return null;
        } 

        const data = document.data();
        if(data === undefined || !(field in data))
        {
            return null;
        }
        
        return data[field];
    }

    async getDocumentMetadata(documentId: string): Promise<DocumentMetadata | null> {
        const metadata : string | null = await this.getDocumentField(documentId, "metadata");
        if(metadata === null) {
            return null;
        }
        return JSON.parse(metadata) as DocumentMetadata;
    }
    
    // deletes the document associated with the documentId
    // throws an error if the document deletion was unsuccessful
    async deleteDocument(documentId: string): Promise<void>
    {
        await firebase.firestore().collection(DOCUMENT_DATABASE_NAME).doc(documentId).delete();
    }
}