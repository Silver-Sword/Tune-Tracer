// This file contains types related to the pools of users that are subscribed to a document

// Purpose: the data associated with an "online" user (a user subscribed to a document)
export type OnlineEntity = 
{
    user_id: string,                    // same as UserEntity
    user_email: string,                 // same as UserEntity
    display_name: string,               // same as UserEntity
    last_active_time: number,           // the last time the user updated the document or moved their cursor
    cursor?: unknown,                   // what the user is editing, highlighting, or has clicked
};
