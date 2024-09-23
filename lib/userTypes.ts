//the UserEntity is the collection of information associated with a user account
export type UserEntity =
{
    user_id: string,                    // the id of the user (Firebase makes one for each registered user)
    user_email: string,                 // the email associated with this user account
    display_name: string,               // the display name for this user
    account_creation_time: number,      // the time (in milliseconds) when this account was created
    owned_documents: string[],          // a list of the document ids associated with all documents that the user created
    shared_documents: string[],         // a list of the document ids associated with all documents that have been shared with this user
};

// Purpose: the data associated with an "online" user (a user subscribed to a document)
export type OnlineEntity = 
{
    user_id: string,                    // same as UserEntity
    user_email: string,                 // same as UserEntity
    display_name: string,               // same as UserEntity
    last_active_time: number,           // the last time the user updated the document or moved their cursor
    cursor?: unknown,                   // what the user is editing, highlighting, or has clicked
};

// Purpose: for defining the kind of update that an OnlineEntity can experience during an online user subscription
export enum UpdateType {
    ADD = 1,                            // the OnlineEntity was added to the pool of online users
    CHANGE = 2,                         // the data in an OnlineEntity was changed
    DELETE = 3,                         // the OnlineEntity was deleted from the pool of online users
};

// purpose: returns the default user (ie a blank user) for use in account creation
// this helps populate the database with the default user information 
export function getDefaultUser(): UserEntity
{
    return {
        user_id: "",
        user_email: "",
        display_name: "",
        owned_documents: [],
        shared_documents: [],
        account_creation_time: Date.now()
    }
}