import React from "react";

import UserColorsModal from "./UserColorsModal";
import OnlineUserIcon from "./OnlineUserIcon";

import { Avatar, Group, Tooltip } from "@mantine/core";

const MAX_USERS_DISPLAYED = 3;

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
      <Avatar.Group>
        {userList.slice(0, MAX_USERS_DISPLAYED).map((user) => (
          <OnlineUserIcon
            color={user.color}
            size={40}
            displayText={user.displayName.toUpperCase().charAt(0)}
            tooltipText={user.displayName}
          />
        ))}

        {userList.length > MAX_USERS_DISPLAYED && (
          <Tooltip label="See all users" withArrow>
            <Avatar
              color="gray"
              size={40}
              radius="xl"
              onClick={onModalOpen}
              style={(theme) => ({
                backgroundColor: theme.colors.gray[1],
                color: theme.colors.gray[7],
                border: "3px solid #222222",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: theme.shadows.xl,
                  transform: "translateY(-2px)",
                },
              })}
            >
              {`+${userList.length - MAX_USERS_DISPLAYED}`}
            </Avatar>
          </Tooltip>
        )}
      </Avatar.Group>
      <UserColorsModal
        opened={modalOpened}
        onClose={onModalClose}
        userList={userList}
      />
    </Group>
  );
};
