import firebase from 'firebase/compat/app'
import 'firebase/compat/auth';
import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";
import { FIREBASE_CONFIG } from '../firebaseSecrets'

export async function signUp (email: string, password: string, displayName: string, firebase: FirebaseWrapper)
{

    const response = await firebase.signUpNewUser(email, password, displayName);

    // TODO : check password requirements
    if (!response)
    {
        return false;
    }
    else
    {
        console.log("Success! Please check your email");
        // TODO : send email to user to verify account
    }

    return true;
}

export async function login (email: string, password: string, firebase: FirebaseWrapper)
{
    try
    {
        const response = await firebase.signInUser(email, password);
    }
    catch (error)
    {
        console.log("Could not sign in. Please check your username or password");
        return false;
    }

    return true;
}