import firebase from 'firebase/compat/app'
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { FIREBASE_CONFIG, DOCUMENT_DATABASE_NAME } from '../firebaseSecrets'

/*
    Wrapper class for doing firebase stuff
    Remember to call .initApp() before doing anything
    Note, all functions are async, so any returns are promises
*/
export default class FirebaseWrapper
{
    async initApp() : Promise<void>
    {
        if (firebase.apps.length === 0) {
            await firebase.initializeApp(FIREBASE_CONFIG);
        }
    }

    async signUpNewUser(email:string, password:string, displayName: string) : Promise<boolean>
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

    // takes in the initial document information as a JSON object
    // returns the document id of the created document
    async createDocument(documentJSON: JSON): Promise<string>
    {
        const documentString = JSON.stringify(documentJSON);
        const firestoreDocument = await firebase.firestore().collection(DOCUMENT_DATABASE_NAME).add({
            documentString: documentString
        });  
        return firestoreDocument.id;
    }

    // takes in the new document
    // returns true iff the document exists and the update was successful
    async updateDocument(documentId: string, documentJSON: JSON): Promise<boolean>
    {
        const documentString = JSON.stringify(documentJSON);
        if(!await this.doesDocumentExist(documentId))
        {
            return false;
        }
        await firebase.firestore()
                      .collection(DOCUMENT_DATABASE_NAME)
                      .doc(documentId)
                      .update({"documentString" : documentString});
        return true;
    }

    // takes in the document unique id and returns the associated document as a JSON object
    // if the document or data doesn't exist, the function returns null
    async getDocument(documentId: string): Promise<JSON | null>
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
        if(data === undefined || !('documentString' in data))
        {
            return null;
        }
        
        return data['documentString'];
    }
    
    // deletes the document associated with the documentId
    // throws an error if the document deletion was unsuccessful
    async deleteDocument(documentId: string): Promise<void>
    {
        await firebase.firestore().collection(DOCUMENT_DATABASE_NAME).doc(documentId).delete();
    }   
}