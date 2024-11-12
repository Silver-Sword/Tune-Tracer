import React from "react";

import UserColorsModal from "./UserColorsModal";
import OnlineUserIcon from "./OnlineUserIcon";

import { Button, Group, Tooltip } from "@mantine/core";

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
        <Tooltip label={user.displayName} withArrow>
          <OnlineUserIcon
            color={user.color}
            size={40}
            display_name={user.displayName}
          />
        </Tooltip>
      ))}
      <Button onClick={onModalOpen}>Online Users</Button>
      <UserColorsModal
        opened={modalOpened}
        onClose={onModalClose}
        userList={userList}
      />
    </Group>
  );
};
