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

// Purpose: for defining the kind of update that an OnlineEntity can experience during an online user subscription
export enum UpdateType {
    ADD = 1,                            // the OnlineEntity was added to the pool of online users
    CHANGE = 2,                         // the data in an OnlineEntity was changed
    DELETE = 3,                         // the OnlineEntity was deleted from the pool of online users
};
