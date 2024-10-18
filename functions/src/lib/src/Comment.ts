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
