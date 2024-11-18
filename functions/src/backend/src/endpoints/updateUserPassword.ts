import firebase from 'firebase/compat/app';
import { updatePassword } from 'firebase/auth';
import { getFirebase } from '../firebase-utils/FirebaseWrapper';
import { checkPassword } from './loginEndpoints';

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

export async function updateUserPasswordFromProfile(email: string, currentPassword: string, newPassword: string): Promise<void> {
    const fb = getFirebase();
    const auth = firebase.auth();
    try
    {
        let user = auth.currentUser;

        if (!user)
        {
            await fb.signInUser(email, currentPassword);
        }
        user = auth.currentUser;
        if (!user)
        {
            throw new Error("Could not sign in user");
        }
        if (!checkPassword(newPassword))
        {
            throw new Error("Password does not meet requirements");
        }
        await updatePassword(user, newPassword);
    }
    catch(error)
    {
        throw error as Error;
    }
}