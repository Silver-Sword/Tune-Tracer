import firebase from 'firebase/compat/app'
import { getAuth} from 'firebase/auth';
import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";

export async function signUpAPI (email: string, password: string, displayName: string)
{
    const firebaseWrapper = new FirebaseWrapper();
    firebaseWrapper.initApp();
    const passwordReqs = await checkPassword(password);

    if (!passwordReqs)
    {
        throw new Error("Password does not meet requirements");
    }
    
    const response = await firebaseWrapper.signUpNewUser(email, password, displayName);

    if (!response)
    {
        throw new Error("No response from server");
    }
    else
    {
        try 
        {
            const user = firebase.auth().currentUser
            if (user)
            {
                user.sendEmailVerification()
            }
            else 
            {
                throw new Error("Error with user identification");
            }
        } 
        catch (error)
        {
            throw new Error("Error with email verification");
        }
    }
    
    console.log("Success! Please check your email");

    return true;
}

async function checkPassword(password: string): Promise<boolean> 
{
    // minimum of 8 letters, one uppercase, one lowercase, one number, and one special character
    let requirements = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");

    if (requirements.test(password))
    {
        return true;
    }
    else
    {
        return false;
    }
}

export async function login (email: string, password: string)
{
    const firebaseWrapper = new FirebaseWrapper();
    firebaseWrapper.initApp();

    try
    {
        await firebaseWrapper.signInUser(email, password);
        const auth = getAuth();
        const user = auth.currentUser;

        if (user)
        {
            if (!user.emailVerified)
            {
                await signOut();
                throw new Error("Please verify your email before signing in");
            }
        }
        
        return user;
    }
    catch (error)
    {
        throw new Error("Could not sign in. Please check your username or password");
    }

}

export async function signOut ()
{
    const auth = getAuth();

    auth.signOut();
}