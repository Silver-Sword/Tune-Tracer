// this is a temporary file to get user information

import { UserEntity } from "@lib/userTypes";
import FirebaseWrapper from "../firebase-utils/FirebaseWrapper";

// I will eventually convert everything to use firebase's auth instead of direct emails

async function getUser(userEmail: string): Promise<UserEntity | null>
{
    const firebase = new FirebaseWrapper();
    firebase.initApp();
    return firebase.getUser(userEmail);
}

export async function getUserIdFromEmail(userEmail: string): Promise<string>
{
    const user = await getUser(userEmail);

    if(user === null)
    {
        throw Error(`Trying to get id for user ${userEmail}, but could not find user in database`);
    }

    return user.user_id;
}