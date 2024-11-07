'use client'

// pages/profile.tsx
import React, { useState } from 'react';
import {
  AppShell,
  Container,
  Text,
  Button,
  Group,
  TextInput,
  Image,
  Avatar,
  PasswordInput
} from '@mantine/core';

const ProfilePage: React.FC = () => {
  const [displayName, setDisplayName] = useState('John Doe');
  const [newDisplayName, setNewDisplayName] = useState(displayName);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const initials = displayName
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase();

  const handleSaveChanges = () => {
    setDisplayName(newDisplayName);
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <AppShell
      navbar={{
        width: 350,
        breakpoint: 'sm',
        
      }}
      padding="md"
    >
      <AppShell.Header
        style={{
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
          padding: '0 20px',
          backgroundColor: '#228be6', // Blue header
        }}
      >
        <Group justify="space-between" px="lg">
          <Image
            src="/TuneTracerLogo.png"
            alt="TuneTracer Logo"
            fit="contain"
            width={50}
            height={50}
          />
        </Group>
      </AppShell.Header>

      <Container
        size="xs"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '4rem',
        }}
      >
        <Avatar radius="xl" size="lg" color="white" style={{ backgroundColor: '#228be6' }}>
          {initials}
        </Avatar>
        <Text
          size="lg"
          style={{ color: 'black', marginTop: '0.5rem', alignItems: 'center' }}
        >
          {displayName}
        </Text>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveChanges();
          }}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          <TextInput
            label="Display Name"
            placeholder="Enter new display name"
            value={newDisplayName}
            onChange={(event) => setNewDisplayName(event.currentTarget.value)}
            mt="md"
          />

          <PasswordInput
            label="Current Password"
            placeholder="Enter current password"
            mt="md"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.currentTarget.value)}
          />

          <PasswordInput
            label="New Password"
            placeholder="Enter new password"
            mt="md"
            value={newPassword}
            onChange={(event) => setNewPassword(event.currentTarget.value)}
          />

          <Group
            mt="md"
            style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
          >
            <Button type="submit" color="blue">
              Save Changes
            </Button>
            <Button variant="subtle" color="gray" onClick={() => alert('Forgot Password?')}>
              Forgot Password
            </Button>
          </Group>
        </form>
      </Container>
    </AppShell>
  );
};

export default ProfilePage;
