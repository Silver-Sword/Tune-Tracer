import firebase from 'firebase/compat/app'
import 'firebase/compat/auth';
import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { FIREBASE_CONFIG } from '../firebaseSecrets'

export async function signUp (email: string, password: string, displayName: string, firebase: FirebaseWrapper)
{
    await firebase.signUpNewUser(email, password, displayName);
    // TODO : check password requirements
    if (!firebase.signUpNewUser(email, password, displayName))
    {
        return false;
    }
    else
    {
        console.log("Success! Please check your email");
        // TODO : send email to user to verify account
    }
}