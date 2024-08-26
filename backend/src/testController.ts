import FirebaseWrapper from "./firebase-utils/FirebaseWrapper";

const TEST_EMAIL = "chrisgittingsucf@gmail.com";
const TEST_PASSWORD = "ThisIsAStrongPassword*50";

export async function runTest()
{
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    await firebase.initApp();
    await testLogIn(firebase);
}

async function testSignUp(firebase: FirebaseWrapper)
{
    await firebase.signUpNewUser(TEST_EMAIL, TEST_PASSWORD, "adminTest1");
}

async function testLogIn(firebase: FirebaseWrapper)
{
    await firebase.signInUser(TEST_EMAIL, TEST_PASSWORD)
    .then(() => {
        console.log("Sign in Successful!")
    }).catch((error) => {
        console.log(`Error caught: ${(error as Error).message}`)
    });
}