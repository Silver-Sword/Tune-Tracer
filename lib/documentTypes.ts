// purpose: for storing and representing a Composition Document
export type Document =
{
    document_title: string,     // the title of the document; the label of the document used on the storage page
    contents: JSON,             // the contents of the composition; the type is temporary (to be replaced later)
    comments: Comment[],        // comments; unusued
    metadata: DocumentMetadata, // the document metadata; this should be treated as a CONST by the frontend
};

// purpose: for storing metadata about a composition document
export type DocumentMetadata =
{
    document_id: string,        // unique id associated with the document; used for firestore
    owner_email: string,        // the user email of the user who created the document; unchanging field
    share_style: SHARE_STYLE,   // the type of publicity for the document
    share_list?: string[],      // OPTIONAL; the user list that the document is shared with
    time_created: number,       // the time (in milliseconds) when the document was created
    last_edit_time: number,     // the time (in milliseconds) when the document was last updated
    last_edit_user: string,     // the user that last updated the document
};

// purpose: for defining how a document has been shared
export enum SHARE_STYLE 
{
    private_document = 1,   // the document has not been shared
    public_document = 2,    // the document has been shared publically without the need to auth checks 
    view_list = 3,          // the document can be viewed only by a select group of users
    comment_list = 4,       // the document can be commented on (and viewed) by a select group of users
    edit_list = 5,          // the document can be edited by (read/write access) a select group of users
};

// purpose: for storing information about comments inside a composition document
export type Comment = 
{
    comment_id: string,
    content: string,
    author_email: string,
    is_reply: boolean,
    reply_id?: string,
    time_created: number,
    last_edit_time: number,
};

