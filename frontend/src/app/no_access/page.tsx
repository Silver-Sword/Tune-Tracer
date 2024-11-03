'use client';

import { Button, Center, Container, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function NoAccessPage() {
  const router = useRouter();

  return (
    <Container>
      <Center style={{ minHeight: '100vh', flexDirection: 'column' }}>
        <Title order={2} mb="lg">
          Access Denied
        </Title>
        <Text mb="md" color="dimmed">
          You don't have permission to view this document. Please contact the document owner if you believe this is an error.
        </Text>
        <Button variant="outline" onClick={() => router.push('/')}>
          Go Back
        </Button>
      </Center>
    </Container>
  );
}
