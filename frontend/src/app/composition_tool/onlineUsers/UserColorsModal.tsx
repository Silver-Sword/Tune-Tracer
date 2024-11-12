// UserColorsModal.tsx

import React from "react";
import { Modal, List, Avatar, Group, Text } from "@mantine/core";
import OnlineUserIcon from "./OnlineUserIcon";

interface UserColorsModalProps {
  opened: boolean;
  onClose: () => void;
  userList: { userId: string; displayName: string; color: string }[];
}

const UserColorsModal: React.FC<UserColorsModalProps> = ({
  opened,
  onClose,
  userList,
}) => {
  return (
    <Modal opened={opened} onClose={onClose} title="Online Users">
      {userList.length === 0 ? (
        <Text>No other users online.</Text>
      ) : (
        <List
          spacing="sm"
          styles={{
            item: {
              listStyleType: "none",
            },
          }}
        >
          {userList.map((user) => (
            <List.Item key={user.userId}>
              <Group>
                <OnlineUserIcon
                  color={user.color}
                  size={24}
                  display_name={user.displayName}
                />
                <Text>{user.displayName}</Text>
              </Group>
            </List.Item>
          ))}
        </List>
      )}
    </Modal>
  );
};

export default UserColorsModal;
