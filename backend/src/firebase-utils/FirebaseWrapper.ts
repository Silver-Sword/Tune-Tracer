import firebase from 'firebase/compat/app'
import 'firebase/compat/auth';
import { FIREBASE_CONFIG } from '../firebaseSecrets'

/*
    Wrapper class for doing firebase stuff
    Remember to call .initApp() before doing anything
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
}