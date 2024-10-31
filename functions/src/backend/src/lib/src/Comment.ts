// purpose: for storing information about comments inside a composition document
export type Comment = 
{
    comment_id: string,
    text: string,
    author_id: string,
    author_display_name: string,
    is_reply: boolean,
    reply_id?: string,
    time_created: number,
    last_edit_time: number,
};
