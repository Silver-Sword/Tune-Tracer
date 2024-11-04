// UserColorsModal.tsx

import React from 'react';
import { Modal, List, Avatar, Group, Text } from '@mantine/core';

interface UserColorsModalProps {
  opened: boolean;
  onClose: () => void;
  userList: { userId: string; displayName: string; color: string }[];
}

const UserColorsModal: React.FC<UserColorsModalProps> = ({ opened, onClose, userList }) => {
  return (
    <Modal opened={opened} onClose={onClose} title="Online Users">
      {userList.length === 0 ? (
        <Text>No other users online.</Text>
      ) : (
        <List spacing="sm">
          {userList.map((user) => (
            <List.Item key={user.userId}>
              <Group>
                <Avatar size={24} radius="xl" style={{ backgroundColor: user.color }}>
                  {user.displayName.charAt(0).toUpperCase()}
                </Avatar>
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