import firebase from 'firebase/compat/app'
import 'firebase/compat/auth';
import "firebase/compat/database";
import 'firebase/compat/firestore';

import { DocumentMetadata, Document } from '@lib/documentTypes';
import { getDefaultUser, OnlineEntity, UserEntity } from '@lib/UserEntity';
import { FIREBASE_CONFIG, DOCUMENT_DATABASE_NAME, USER_DATABASE_NAME } from '../firebaseSecrets'

type PartialWithRequired<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;
type PartialWithRequiredAndWithout<T, K extends keyof T, U extends keyof T> = Partial<T> & Required<Omit<Pick<T, K>, U>>;

/*
    Wrapper class for doing firebase stuff
    Remember to call .initApp() before doing anything
    Note, all functions are async (except initApp), so any returns are promises
*/
export default class FirebaseWrapper
{
    public initApp(): void
    {
        if (firebase.apps.length === 0) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
    }

    // creates an account for a user with the given email and password
    // will throw an Error if the account creation failed 
    // (see https://firebase.google.com/docs/auth/admin/errors for more details)
    public async signUpNewUser(email: string, password: string, displayName: string): Promise<boolean>
    {
        let user;
        try {
            // user sign up
            await firebase.auth().createUserWithEmailAndPassword(email, password);
            user = firebase.auth().currentUser;
            if(!user)
            {
                throw Error('Something went wrong with user signup. User is null');
            }
    
            // update username
            await user.updateProfile({
                displayName : displayName
            });

            const userEntity: UserEntity = getDefaultUser();
            userEntity.user_email = email;
            userEntity.display_name = displayName;
            userEntity.user_id = user.uid;

            await firebase.firestore()
                          .collection(USER_DATABASE_NAME)
                          .doc(email)
                          .set(userEntity);

        } catch(error) {
            // if the account creation failed, make sure to remove all updates made to Firestore
            await firebase.firestore()
                          .collection(USER_DATABASE_NAME)
                          .doc(email)
                          .delete();
            await user?.delete()
                       .catch( (deletionError) => {
                            console.log(
                                `Another error occurred when attempted to delete the user data after the user account 
                                 failed to be created.\nDetails: ${deletionError.message}`
                        )});
            
            // rethrow the error so that the error is passed along
            throw error;
        }

        return true;
    }

    // will throw an error on a failed sign in
    public async signInUser(email: string, password: string) : Promise<void>
    {
        await firebase.auth().signInWithEmailAndPassword(email, password);
    }

    public async doesDocumentExist(documentId: string): Promise<boolean>
    {
        return (await firebase.firestore()
                      .collection(DOCUMENT_DATABASE_NAME)
                      .doc(documentId)
                      .get()).exists;
    }

    public async doesUserExist(userId: string): Promise<boolean>
    {
        return (await firebase.firestore()
                      .collection(USER_DATABASE_NAME)
                      .doc(userId)
                      .get()).exists;
    }

    // creates a blank composition document and returns the id of the created document
    public async createDocument(): Promise<string>
    {
        const firestoreDocument = await firebase
            .firestore()
            .collection(DOCUMENT_DATABASE_NAME)
            .add({});
        return firestoreDocument.id;
    }

    // takes in the new document
    // returns true iff the document exists and the update was successful
    // UNUSED
    public async updateDocument(documentId: string, document: Document): Promise<boolean>
    {
        if(!await this.doesDocumentExist(documentId))
        {
            return false;
        }
        await firebase.firestore()
                      .collection(DOCUMENT_DATABASE_NAME)
                      .doc(documentId)
                      .update(document);
        return true;
    }

    // updates somes field in a document
    // throws an error if the document does not exist
    public async updatePartialDocument(documentId: string, updateObject: Record<string, unknown>)
        : Promise<boolean>
    {
        if(!await this.doesDocumentExist(documentId))
        {
            throw Error(`Document with id ${documentId} does not exist`);
        }

        await firebase.firestore()
                      .collection(DOCUMENT_DATABASE_NAME)
                      .doc(documentId)
                      .update(updateObject);
        return true;
    }

    // takes in the document unique id and returns the associated document as a JSON object
    // if the document or data doesn't exist, the function returns null
    public async getDocument(documentId: string): Promise<Document | null>
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
        if(data === null || data === undefined)
        {
            return null;
        }
        return data as Document;
    }

    public async getDocumentField<T>(documentId: string, field: string): Promise<T | null> {
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

    public async getDocumentMetadata(documentId: string): Promise<DocumentMetadata | null> {
       return await this.getDocumentField<DocumentMetadata>(documentId, "metadata");
    }
    
    // deletes the document associated with the documentId
    // throws an error if the document deletion was unsuccessful
    public async deleteDocument(documentId: string): Promise<void>
    {
        await firebase.firestore().collection(DOCUMENT_DATABASE_NAME).doc(documentId).delete();
    }

    // gets the list of document ids of documents owned (if isOwned is true) or shared (is isOwned is false)
    // by a particular user
    public async getUserDocuments(userId: string, isOwned: boolean): Promise<string[]>
    {
        const collection = (await firebase.firestore()
            .collection(USER_DATABASE_NAME)
            .doc(userId)
            .get());
        
        if(!collection.exists)
        {
            return [];
        } 

        const fieldName = isOwned ? 'owned_documents' : 'shared_documents';
        const data = collection.data();
        if(data === undefined || !(fieldName in data))
        {
            return [];
        }
        
        return data[fieldName] as string[];
    }

    // add a document to a list of documents that the user either owns or has access to
    // isOwned is true iff the userId is associated with the user that created the document
    // assumption: the user must not own the document if isOwned is set to false
    // will throw an Error if the user does not exist
    public async insertUserDocument(userId: string, documentId: string, isOwned: boolean): Promise<void>
    {
        if(!this.doesUserExist(userId))
        {
            throw Error(`Trying to share document ${documentId} with user ${userId}, but user does not exist`);
        }
        const data = firebase.firestore.FieldValue.arrayUnion(documentId);
        const updatedObject = isOwned ? {'owned_documents': data} : {'shared_documents': data};
        await firebase.firestore()
                    .collection(USER_DATABASE_NAME)
                    .doc(userId)
                    .update(updatedObject);
    }

    // delete a document from a list of documents that the user either owns or has access to
    // isOwned is true iff the userId is associated with the user that created the document
    public async deleteUserDocument(userId: string, documentId: string, isOwned: boolean): Promise<void>
    {
        const data = firebase.firestore.FieldValue.arrayRemove(documentId);
        const updatedObject = isOwned ? {'owned_documents': data} : {'shared_documents': data};
        await firebase.firestore()
                    .collection(USER_DATABASE_NAME)
                    .doc(userId)
                    .update(updatedObject);
    }

    // NOT FOR EXTERNAL USE (use the subscription fn in documentOperations.ts instead)
    // wrapper for the document subscription
    public async subscribeToDocument(
        documentId: string, 
        onSnapshotFn: (snapshot: firebase.firestore.DocumentSnapshot) => void
    ){
        firebase.firestore()
                .collection(DOCUMENT_DATABASE_NAME)
                .doc(documentId)
                .onSnapshot( onSnapshotFn);
    }
    
    public async registerUserToDocument(
        documentId: string, 
        user: {
            user_email: string, 
            user_id: string, 
            display_name: string
    }) {
        const userReference = firebase.database().ref(`/presence/${documentId}/users/${user.user_id}`);
        await userReference.set({
            user_id: user.user_id,
            user_email: user.user_email,
            display_name: user.display_name,
            last_active_time: firebase.database.ServerValue.TIMESTAMP
        });
        userReference.onDisconnect().remove();
    }

    // TO DO: check if user is already registered to the document
    public async updateUserInDocument(
        documentId: string, 
        user: PartialWithRequiredAndWithout<OnlineEntity, 'user_id', 'last_active_time'>
    ) {
        const userReference = firebase.database().ref(`/presence/${documentId}/users/${user.user_id}`);
        await userReference.update({
            ...user,
            last_active_time: firebase.database.ServerValue.TIMESTAMP
        });
    }
}