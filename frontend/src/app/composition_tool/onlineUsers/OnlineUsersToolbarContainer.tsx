import React from "react";

import UserColorsModal from "./UserColorsModal";
import OnlineUserIcon from "./OnlineUserIcon";

import { Button, Group } from "@mantine/core";

interface OnlineUsersToolbarContainerProps {
  modalOpened: boolean;
  onModalOpen: () => void;
  onModalClose: () => void;
  userList: { userId: string; displayName: string; color: string }[];
}

export const OnlineUsersToolbarContainer: React.FC<
  OnlineUsersToolbarContainerProps
> = ({ modalOpened, onModalOpen, onModalClose, userList }) => {
  return (
    <Group>
        {userList.slice(0, 2).map((user) => (
            <OnlineUserIcon
                user_id={user.userId}
                display_name={user.displayName}
                color={user.color}
                size={40}
            />
        ))
        }
        <Button onClick={onModalOpen}>Online Users</Button>
        <UserColorsModal
            opened={modalOpened}
            onClose={onModalClose}
            userList={userList}
        />

    </Group>
  );
};
