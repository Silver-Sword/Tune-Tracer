//the UserEntity is the collection of information associated with a user account
export type UserEntity =
{
    user_id: string,                    // the id of the user (Firebase makes one for each registered user)
    user_email: string,                 // the email associated with this user account
    display_name: string,               // the display name for this user
    account_creation_time: number,      // the time (in milliseconds) when this account was created
    owned_documents: string[],          // a list of the document ids associated with all documents that the user created
    shared_documents: string[],         // a list of the document ids associated with all documents that have been shared with this user
    accessed_documents: string[],       // a list of the document ids that were accessed by this user without being explicitly shared
};

// the way a user got access to a document (and the associated field name in Firestore) 
// owned: the user created the document
// shared: the user was given access to the document explicitly through email
// accessed: the user accessed the document through a link or share code
export type AccessType =  "owned" | "shared" | "accessed";

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
        accessed_documents: [],
        account_creation_time: Date.now()
    }
}