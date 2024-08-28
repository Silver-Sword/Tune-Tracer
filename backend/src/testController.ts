import FirebaseWrapper from "./firebase-utils/FirebaseWrapper";

const TEST_EMAIL = "chrisgittingsucf@gmail.com";
const TEST_PASSWORD = "ThisIsAStrongPassword*50";

export async function runTest()
{
    const firebase: FirebaseWrapper = new FirebaseWrapper();
    await firebase.initApp();
    await testDocumentRead(firebase);
    process.exit(0);
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

async function testDocumentAdd(firebase: FirebaseWrapper)
{
    const exampleDocument = JSON.parse(JSON.stringify({
        owner: "someemail@example.com",
        title: "Document Title",
        content: {
            music: "ABCDEFG",
            notes: [0, 1, 2, 3, 4, 5],
            something: 1
        }
    }));
    const id = await firebase.createDocument(exampleDocument);
    console.log(`Document Id: ${id}`);
}

async function testDocumentUpdate(firebase: FirebaseWrapper)
{
    const exampleDocument = JSON.parse(JSON.stringify({
        owner: "someemail@example.com",
        title: "Document Title",
        content: {
            music: "ABCDEFG",
            notes: [0, 1, 2, 3, 4, 5],
            something: 1
        }
    }));
    const id = await firebase.createDocument(exampleDocument);
    console.log(`Document Id: ${id}`);

    exampleDocument.title = "New Document Title";
    const success = await firebase.updateDocument(id, exampleDocument);
    console.log(`Document Update was successful: ${success ? "true" : "false"}`);
}

async function testDocumentDeletion(firebase: FirebaseWrapper)
{
    const exampleDocument = JSON.parse(JSON.stringify({
        owner: "someemail@example.com",
        title: "Document Title",
        content: {
            music: "ABCDEFG",
            notes: [0, 1, 2, 3, 4, 5],
            something: 1
        }
    }));
    const id = await firebase.createDocument(exampleDocument);
    console.log(`Document Id: ${id}`);
    const success = await firebase.deleteDocument(id);
}

async function testDocumentRead(firebase: FirebaseWrapper)
{
    const knownId = "hlWB73fSeHpknyFELFk1";
    const data = await firebase.getDocument(knownId);
    console.log(`Document Data: ${data ? JSON.stringify(data) : "null"}`);
}