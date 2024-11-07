import React, { useState } from 'react';
import { Group, Text, Select } from '@mantine/core';
import { CollaboratorProps } from './sharing_types';

export const CollaboratorCard: React.FC<CollaboratorProps> = ({ name, email, role, onRoleChange, onRemove, isDisabled=false }) => {
  const [currentRole, setCurrentRole] = useState<'Viewer' | 'Editor' | 'Remove access'>(role);

  const handleRoleChange = (newRole: 'Viewer' | 'Editor' | 'Remove access') => {
    if (newRole === 'Remove access') {
      onRemove();
    } else {
      setCurrentRole(newRole);
      onRoleChange(newRole);
    }
  };

  return (
    <Group
      justify="space-between"
      style={{
        padding: '15px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        marginBottom: '10px',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Group>
        <div>
          <Text size="sm">{name}</Text>
          <Text size="xs" c="dimmed">{email}</Text>
        </div>
      </Group>

      <Select
        checkIconPosition="right"
        value={currentRole}
        onChange={(newRole) => handleRoleChange(newRole as 'Viewer' | 'Editor' | 'Remove access')}
        data={[
          { value: 'Viewer', label: 'Viewer' },
          { value: 'Editor', label: 'Editor' },
          { value: 'Remove access', label: 'Remove access' }
        ]}
        style={{ width: 150 }}
        disabled={isDisabled}
        allowDeselect={false}
      />
    </Group>
  );
};