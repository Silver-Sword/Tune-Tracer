import * as d3 from 'd3';
import React from 'react';

import { OnlineEntity } from "../../lib/src/realtimeUserTypes";
import { SelectedNote } from "../../lib/src/SelectedNote";

type UserCursor = {
    userId: string,
    color: string,
    displayName: string,
    cursor: SelectedNote,
}

export function processOnlineUsersCursors(
    selfUserId: string | undefined,
    onlineUsers: Map<string, OnlineEntity>,
    userList: React.MutableRefObject<{ userId: string; displayName: string; color: string }[] | undefined>,
    fetchDisplayName: (userId: string) => Promise<string>,
) {

    // First, clear previous highlighting for other users
    d3.selectAll('.other-user-highlight').each(function () {
        d3.select(this).style('fill', null);
        d3.select(this).classed('other-user-highlight', false);
    });

    // Iterate over onlineUsers
    onlineUsers.forEach((onlineEntity, user_id) => {
        // Exclude the current user
        if (user_id !== selfUserId) {
            const cursor = onlineEntity.cursor as SelectedNote;
            if (cursor && cursor.noteID && cursor.color) {
                const noteHeadId = cursor.noteID;
                const color = cursor.color;

                // Select the notehead element by its CSS ID
                const noteHeadElement = d3.select(`[id="${noteHeadId}"]`);
                if (!noteHeadElement.empty()) {
                    noteHeadElement
                        .style('fill', color)
                        .classed('other-user-highlight', true);
                } else {
                    console.warn(`Notehead with ID ${noteHeadId} not found`);
                }
            }
        }
    });

    const updateUserList = async () => {
        console.log('Running updateUserList!');
        const users: { userId: string; displayName: string; color: string }[] = [];


        onlineUsers.forEach((onlineEntity, userIdKey) => {
            console.log(`Is ${userIdKey} !== ${selfUserId}?`);
            if (userIdKey !== selfUserId) {
                const cursor = onlineEntity.cursor as SelectedNote;
                if (cursor && cursor.color) {
                    const color = cursor.color;
                    fetchDisplayName(userIdKey).then((displayName) => {
                        users.push({ userId: userIdKey, displayName, color });
                    });
                }
            }
        });

        userList.current = users;
    };


    updateUserList();
}