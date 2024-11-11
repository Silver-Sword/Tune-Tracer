import firebase from 'firebase/compat/app';
import { getFirebase } from '../firebase-utils/FirebaseWrapper';

export async function updateUserPassword(email: string): Promise<void> {
    try
    {
        getFirebase();
        const auth = firebase.auth();
        if (auth) 
        {
            await auth.sendPasswordResetEmail(email);
        }
        else 
        {
            throw Error("Could not reset password for supplied email");
        }
    } catch (error)
    {
        throw error as Error;
    }
}