/*
    the UserEntity is the type that describes a user account
*/
export type UserEntity =
{
    user_email: string,                 // the email associated with this user account
    display_name: string,               // the display name for this user
    account_creation_time: number,      // the time (in milliseconds) when this account was created
    owned_documents: string[],          // a list of the document ids associated with all documents that the user created
    shared_documents: string[],         // a list of the document ids associated with all documents that have been shared with this user
};

// purpose: returns the default user (ie a blank user) for use in account creation
// this helps populate the database with the default user information 
export function getDefaultUser(): UserEntity
{
    return {
        user_email: "",
        display_name: "",
        owned_documents: [],
        shared_documents: [],
        account_creation_time: Date.now()
    }
}