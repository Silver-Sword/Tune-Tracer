'use client';

import { Button, Center, Container, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function SignUpSuccess() {
  const router = useRouter();

  return (
    <Container>
      <Center style={{ minHeight: '100vh', flexDirection: 'column' }}>
        <Title order={2} mb="lg">
        Sign up successful!
        </Title>
        <Text mb="md" color="dimmed">
           Make sure to check your email to verify your account. Then you can login.
        </Text>
        <Button variant="outline" onClick={() => router.push('/login')}>
          Go To Login
        </Button>
      </Center>
    </Container>
  );
}
