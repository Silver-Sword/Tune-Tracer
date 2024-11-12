import React from "react";

import UserColorsModal from "./UserColorsModal";

import { Button } from "@mantine/core";

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
    <>

    <Button onClick={onModalOpen}>Online Users</Button>
    <UserColorsModal
      opened={modalOpened}
      onClose={onModalClose}
      userList={userList}
    />

    </>
  );
};
