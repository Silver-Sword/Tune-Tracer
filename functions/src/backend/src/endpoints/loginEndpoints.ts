import firebase from 'firebase/compat/app'
import { getAuth} from 'firebase/auth';
// import 'firebase/compat/auth';
import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";

const signUpAPI = async (email: string, password: string, displayName: string) =>
{
    const firebaseWrapper = new FirebaseWrapper();
    firebaseWrapper.initApp();
    const passwordReqs = await checkPassword(password);

    if (!passwordReqs)
    {
        console.log("Your password does not meet the requirements");
        return false;
    }

    const response = await firebaseWrapper.signUpNewUser(email, password, displayName);

    if (!response)
    {
        return false;
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
        } 
        catch (error)
        {
            console.log("Error with email");
            return false;
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
                console.log("Please verify your email before signing in");
                return false;
            }
        }
    }
    catch (error)
    {
        console.log("Could not sign in. Please check your username or password");
        return false;
    }

    return true;
}

export async function signOut ()
{
    const auth = getAuth();

    auth.signOut();
}

module.exports = { signUpAPI, login }; 