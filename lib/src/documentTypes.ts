import { CompositionData } from "./CompToolData";

// purpose: for storing and representing a Composition Document
export type Document =
{
    document_title: string,             // the title of the document; the label of the document used on the storage page
    comments: Comment[],                // comments; unusued
    composition: CompositionData,       // the contents of the composition
    metadata: DocumentMetadata,         // the document metadata; this should be treated as a CONST by the frontend
};

// purpose: for storing metadata about a composition document
export type DocumentMetadata =
{
    document_id: string,                // unique id associated with the document; used for firestore
    owner_id: string,                   // the user id of the user who created the document; unchanging field
    time_created: number,               // the time (in milliseconds) when the document was created
    last_edit_time: number,             // the time (in milliseconds) when the document was last updated
    last_edit_user: string,             // the user that last updated the document
    is_favorited: boolean,              // whether or not the user has starred/favorited the document
    is_trashed: boolean,                // whether or not the user has trashed the document
    preview_emoji?: string,             // the emoji that represents this document | visible on the storage page
    preview_color?: string,             // the color that the user chose for this document | visible on the storage page
    share_link_style: ShareStyle,       // the type of publicity for the document (specific to links and share codes)
    share_list: Record<string, ShareStyle>,      // the users that have access to the document and the permissions given to them
};

// purpose: for defining how a document has been shared
export enum ShareStyle 
{
    NONE = 1,                           // the document has not been shared
    READ = 2,                           // the document can be read by other users 
    COMMENT = 3,                        // the document can be read and commented on by other users
    WRITE = 4,                          // the document can be read, commented on, and edited by other users
};

// purpose: for storing information about comments inside a composition document
export type Comment = 
{
    comment_id: string,
    content: string,
    author_id: string,
    is_reply: boolean,
    reply_id?: string,
    time_created: number,
    last_edit_time: number,
};

// purpose: the preview information of a document for use on a user's storage page
export type DocumentPreview = DocumentMetadata & {document_title: string};