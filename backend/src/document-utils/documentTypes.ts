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

// purpose for storing metadata about a composition document
export type DocumentMetadata =
{
    document_id: string,
    owner_email: string,
    share_style: SHARE_STYLE,
    share_list?: string[],
    time_created: number,
    last_edit_time: number,
};

// purpose: manipulate composition documents in the code
export type Document =
{
    document_title: string,
    contents: JSON,
    comments: Comment[],
    metadata: DocumentMetadata,
};

// purpose: for storing a document in firestore
export type FirebaseDocumentData =
{
    documentString: string,
    metadata: string
};