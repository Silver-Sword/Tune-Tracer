import * as d3 from "d3";
import React from "react";

import { OnlineEntity } from "../../lib/src/realtimeUserTypes";
import { SelectedNote } from "../../lib/src/SelectedNote";

const MAX_INACTIVE_TIME = 1000 * 60 * 15; // 15 minutes

type Cursor = {
  userId: string;
  color: string;
  displayName: string;
};

export function updateSelectedNote(
  userId: string,
  color: string,
  noteID?: string | undefined
) {
  const className = `user-${userId}-cursor`;
  const noteName = noteID !== undefined ? `[id="${noteID}"]` : undefined;

  // remove previous cursor
  d3.selectAll(`.${className}`).each(function () {
    d3.select(this).style("fill", null);
    d3.select(this).classed(`${className}`, false);
  });

  // add new cursor
  if (noteName) {
    const noteHeadElement = d3.select(`${noteName}`);
    if (!noteHeadElement.empty()) {
      noteHeadElement.style("fill", color).classed(`${className}`, true);
    } else {
      console.warn(`userId= Notehead with ID ${noteName} not found`);
    }
  }
}

export function processOnlineUsersUpdate(
  selfUserId: string | undefined,
  onlineUsers: Map<string, OnlineEntity>,
  userList: React.MutableRefObject<Cursor[]>
) {
  // Iterate over onlineUsers
  onlineUsers.forEach((onlineEntity, user_id) => {
    // Exclude the current user
    if (
      user_id === selfUserId ||
      onlineEntity.cursor_color === undefined // old data format, do not process
    ) {
      return;
    } else if(Date.now() - onlineEntity.last_active_time > MAX_INACTIVE_TIME) { // remove inactive users
        userList.current = userList.current.filter(
          (user) => user.userId !== user_id
        );
        return;
    }

    const cursor = onlineEntity.cursor as SelectedNote;
    const cursorColor = onlineEntity.cursor_color;
    const filteredUserList = userList.current.filter(
      (user) => user.userId === user_id
    );

    // add the user to the user list if they are not already there
    let previousUser =
      filteredUserList.length > 0 ? filteredUserList[0] : undefined;
    if (previousUser === undefined) {
      userList.current.push({
        userId: user_id,
        displayName: onlineEntity.display_name,
        color: cursorColor,
      });
      previousUser = userList.current.at(-1) as Cursor;
    }

    updateSelectedNote(user_id, cursorColor, cursor?.noteID);
  });
}
