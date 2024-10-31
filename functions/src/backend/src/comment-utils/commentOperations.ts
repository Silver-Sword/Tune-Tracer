
import { Comment } from "../lib/src/Comment";
import { UpdateType } from "../lib/src/UpdateType";

import { getFirebase } from "../firebase-utils/FirebaseWrapper";
import { recordOnlineUserUpdatedDocument } from "../document-utils/realtimeOnlineUsers";
import { userHasCommentAccess } from "../security-utils/permissionVerification";

// creates a comment and returns the comment id
// replyId is the id of the direct parent comment (the one being replied to) or null if this comment is not a reply
export async function createComment(
    commentText: string, 
    replyId: string | null, 
    user: {user_id: string, display_name: string}, 
    documentId: string, 
): Promise<string> {
    if(!(await hasCommentPermissions(user.user_id, documentId)))
    {
        throw Error(`User ${user.user_id} does not have permissions to comment on document ${documentId}`);
    }

    const commentId = await getFirebase().createComment({
        text: commentText,
        author_id: user.user_id,
        author_display_name: user.display_name,
        is_reply: replyId !== null,
        ...(replyId ? { reply_id: replyId } : {}),
    }, documentId);
    await recordOnlineUserUpdatedDocument(documentId, user);

    return commentId;
}

// deletes a comment
// userId is the id of the user doing the deletion. This function does not validate if they are allowed to delete the particular comment.
export async function deleteComment(
    commentId: string,
    documentId: string,
    userId: string
): Promise<boolean> {
    if(!(await hasCommentPermissions(userId, documentId)))
    {
        throw Error(`User ${userId} does not have permissions to comment on document ${documentId}`);
    }

    await getFirebase().deleteComment(commentId, documentId);
    await recordOnlineUserUpdatedDocument(documentId, {user_id: userId});

    return true;
}

// resets the text of a comment
// user id should be both the author id and the editor id (please check that they are the same person)
export async function editCommentText(
    newText: string,
    commentId: string,
    documentId: string,
    userId: string,
) {
    if(!(await hasCommentPermissions(userId, documentId)))
    {
        throw Error(`User ${userId} does not have permissions to comment on document ${documentId}`);
    }

    await getFirebase().updateComment({
        text: newText,
        comment_id: commentId,
    }, documentId);
    await recordOnlineUserUpdatedDocument(documentId, {user_id: userId});
}

// subscribe to the "pool" of comments of a particular document
export async function subscribeToComments(
    documentId: string,
    userId: string,
    updateCommentFn: (updateType: UpdateType, comment: Comment) => void
) {
    if(!(await hasCommentPermissions(userId, documentId)))
    {
        throw Error(`User ${userId} does not have permissions to comment on document ${documentId}`);
    }

    await getFirebase().subscribeToDocumentComments(documentId, updateCommentFn);
}

async function hasCommentPermissions(userId: string, documentId: string): Promise<boolean> {
    const document = await getFirebase().getDocument(documentId);
    if(document === null)
    {
        return false;
    }

    return await userHasCommentAccess(userId, document);
}