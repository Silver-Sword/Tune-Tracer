import { getFirebase } from "src/firebase-utils/FirebaseWrapper";

async function signUpNewUser(email: string, password: string, displayName: string): Promise<void> {
    const firebase = getFirebase();
    await firebase.signUpNewUser(email, password, displayName);
}

async function signInUser(email: string, password: string): Promise<void> {
    const firebase = getFirebase();
    await firebase.signInUser(email, password);
}

async function updateUserPassword(password: string, userId: string): Promise<void> {
    const firebase = getFirebase();
    await firebase.updateUserPassword(password);
}

async function updateUserDisplayName(displayName: string, userId: string): Promise<void> {
    const firebase = getFirebase();
    await firebase.updateUserDisplayName(displayName);
}