// purpose: for storing metadata about a composition document
export type DocumentMetadata =
{
    document_id: string,                // unique id associated with the document; used for firestore
    owner_id: string,                   // the user id of the user who created the document; unchanging field
    time_created: number,               // the time (in milliseconds) when the document was created
    last_edit_time: number,             // the time (in milliseconds) when the document was last updated
    last_edit_user: string,             // the user that last updated the document
    is_trashed: boolean,                // whether or not the user has trashed the document
    share_link_style: ShareStyle,       // the type of publicity for the document (specific to links and share codes)
    share_list: Record<string, ShareStyle>,      // the users that have access to the document and the permissions given to them
};

export function getDefaultDocumentMetadata(): DocumentMetadata
{
    return {
        document_id: "",
        owner_id: "",
        time_created: Date.now(),
        last_edit_time: Date.now(),
        last_edit_user: "",
        is_trashed: false,
        share_link_style: ShareStyle.NONE,
        share_list: {},
    } as DocumentMetadata;
}

// purpose: for defining how a document has been shared
export enum ShareStyle
{
    NONE = 1,                           // the document has not been shared
    READ = 2,                           // the document can be read by other users 
    COMMENT = 3,                        // the document can be read and commented on by other users
    WRITE = 4,                          // the document can be read, commented on, and edited by other users
};

// purpose: the properties of a document that are local to a user
export type UserLevelDocumentProperties =
{
    is_favorited: boolean,              // whether or not the user has starred/favorited the document
    preview_emoji?: string,             // the emoji that represents this document | visible on the storage page
    preview_color?: string,             // the color that the user chose for this document | visible on the storage page
};

// purpose: the preview information of a document for use on a user's storage page
export type DocumentPreview = DocumentMetadata & { document_title: string } & UserLevelDocumentProperties;