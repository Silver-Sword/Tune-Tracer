'use client'

import React from 'react';
import { AppShell, Container, Text, Button, Title, Center, Group, Space, Stack } from '@mantine/core';
import { IconFileUnknown } from '@tabler/icons-react';

export default function NotFoundPage() {
  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
    >
      <AppShell.Header
        style={{
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* TODO: add tune tracer logo */}
        <Group justify="space-between" px="lg">
          <Text>Tune Tracer</Text>
            {/* TODO: Swap this out with user info if logged in */}
          <Group>
            <Button component="a" href="/login">Login</Button>
            <Button component="a" href="/signup">Sign Up</Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container
          fluid
          style={{
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(154,215,255,1) 0%, rgba(0,105,182,1) 100%)'
          }}
        >
          <Center>
            <Stack align="center" >
              <IconFileUnknown size={100} color="#fff" />
              <Title order={1} c="white">Oops! Page Not Found</Title>
              <Text size="xl" c="white">
                The document you're looking for might be missing or you may not have the correct permissions to access it.
              </Text>
              <Space h="md" />
              {/* TODO: Add this button to go somewhere 
              <Group>
                <Button component="a" href="/" size="lg" variant="outline" color="white">
                  Go to Home
                </Button>
              </Group> */}
            </Stack>
          </Center>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}