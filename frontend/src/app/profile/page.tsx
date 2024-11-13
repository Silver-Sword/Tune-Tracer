'use client'

// pages/profile.tsx
import React, { useState, useEffect } from 'react';
import { getUserID, getDisplayName, saveDisplayName } from "../cookie";
import { useRouter } from "next/navigation";
import { callAPI } from "../../utils/callAPI";
import Link from 'next/link';
import {
  AppShell,
  Container,
  Text,
  Button,
  Group,
  TextInput,
  Image,
  Avatar,
  PasswordInput,
  Tooltip
} from '@mantine/core';

const ProfilePage: React.FC = () => {
  const [displayName, setDisplayName] = useState('John Doe');
  const [newDisplayName, setNewDisplayName] = useState(displayName);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [email, setEmail] = useState<string>('');
  const [userId, setUID] = useState<string>('');
  const router = useRouter();
  const [displayNameLoading, setDisplayNameLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string>('');
  useEffect(() => {
    let displayCookie = getDisplayName();
    let userIdCookie = getUserID();
    if (userIdCookie == '-1') router.push('/');
    setDisplayName(displayCookie);
    setNewDisplayName(displayCookie);
    setUID(userIdCookie);
  }, []);

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

  const handleDisplayNameChange = async () => {
    if(newDisplayName == displayName) return;
    setDisplayNameLoading(true);
    const displayNameObj = {
      userId: userId,
      displayName: newDisplayName
    }
    let response = await callAPI("updateUserDisplayName", displayNameObj);
    if(response.status !== 200)
    {
      setDisplayNameLoading(false);
      setError("Something went wrong");
      return;
    }

  setDisplayNameLoading(false);
  setDisplayName(newDisplayName);
  saveDisplayName(newDisplayName);
  setResponse("Display name changed!");
  setTimeout(() => {
    setResponse("");
  }, 5000);

  };

  return (
    <AppShell
      navbar={{
        width: 350,
        breakpoint: 'sm',

      }}
      header={{ height: 80 }}
      padding="md"
    >
      <AppShell.Header
      
        style={{
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Group justify="space-between" px="lg">
          {/* Need to route back to storage page */}
          <Tooltip label="Back to Home">
            <Link href="/storage">
              <Image
                // component="a"
                // href="/storage"
                h={50}
                w="auto"
                fit="contain"
                src="TuneTracerLogo.png"
              />
            </Link>
          </Tooltip>
        </Group>
      </AppShell.Header>

      <Container
        size="xs"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '100px',
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
          <Group
            mt="md"
            style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
          >
            <Button type="submit" color="blue" loading={displayNameLoading} onClick={handleDisplayNameChange}>
              Save New Display Name
            </Button>
            {response && (
              <Text size="sm" style={{ marginTop: "0.25rem" }}>
                {response}
              </Text>
            )}

            {error && (
              <Text color="red" size="sm" style={{ marginTop: "0.25rem" }}>
                {error}
              </Text>
            )}
          </Group>

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
              Change Password
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
