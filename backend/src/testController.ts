import FirebaseWrapper from "./firebase-utils/FirebaseWrapper";
export async function runTest()
{
    const firebase : FirebaseWrapper = new FirebaseWrapper();
    await firebase.initApp();
    firebase.signUpNewUser("chrisgittingsucf@gmail.com", "ThisIsAStrongPassword*50", "adminTest1");
}