'use client'

import React from 'react';
import {
  AppShell,
  Button,
  Container,
  Flex,
  Group,
  Image,
  Tabs,
  Text,
  Title,
  createTheme,
  MantineProvider,
} from '@mantine/core'
import { IconMusic, IconCloud, IconUsers, IconLock, IconDownload, IconHelp } from '@tabler/icons-react'

// Create theme with custom colors
const theme = createTheme({
  colors: {
    brand: [
      '#E3F2FD',
      '#BBDEFB',
      '#90CAF9',
      '#64B5F6',
      '#42A5F5',
      '#228be6', // Primary color
      '#1a62a1', // Hover color
      '#1565C0',
      '#0D47A1',
      '#0A2472',
    ],
  },
  primaryColor: 'brand',
})

export default function LandingPage() {
  return (
    <MantineProvider theme={theme}>
      <AppShell
        header={{ height: 60 }}
      >
        <AppShell.Header>
          <Container size="xl">
            <Flex h={60} align="center" justify="space-between">
              <Group>
                <IconMusic size={30} style={{ color: '#228be6' }} />
                <Text size="xl" fw={700}>
                  Tune Tracer
                </Text>
              </Group>
              <Group>
                <Button variant="subtle" color="brand">
                  Solutions
                </Button>
                <Button variant="subtle" color="brand">
                  Features
                </Button>
                <Button variant="subtle" color="brand">
                  Pricing
                </Button>
                <Button variant="subtle" color="brand">
                  Resources
                </Button>
                <Button variant="outline" color="brand">
                  Try Tune Tracer
                </Button>
                <Button color="brand">Sign in</Button>
              </Group>
            </Flex>
          </Container>
        </AppShell.Header>
        <AppShell.Main>
          <Container size="xl" mt={50}>
            <Flex gap={50} align="center">
              <div style={{ flex: 1 }}>
                <Title order={1} size={48} mb="md">
                  Create and share music online
                </Title>
                <Text size="lg" c="dimmed" mb="xl" maw={600}>
                  Welcome to Tune Tracer, where music composition meets innovation and collaboration. Our platform transforms
                  your musical ideas into beautiful sheet music, effortlessly saved to the cloud.
                </Text>
                <Group>
                  <Button size="lg" color="brand">
                    Sign in
                  </Button>
                  <Button size="lg" variant="outline" color="brand">
                    Try Tune Tracer
                  </Button>
                </Group>
              </div>
              <Image
                src="/placeholder.svg?height=400&width=500"
                alt="Tune Tracer Interface"
                style={{ flex: 1 }}
                radius="md"
              />
            </Flex>

            <Tabs
              defaultValue="compose"
              variant="outline"
              mt={80}
              styles={{
                tab: {
                  fontSize: '16px',
                  padding: '20px 30px',
                  '&[dataActive]': {
                    borderColor: '#228be6',
                  },
                },
              }}
            >
              <Tabs.List grow mb="xl">
                <Tabs.Tab value="compose" leftSection={<IconMusic size={20} />}>
                  Compose
                </Tabs.Tab>
                <Tabs.Tab value="store" leftSection={<IconCloud size={20} />}>
                  Store
                </Tabs.Tab>
                <Tabs.Tab value="collaborate" leftSection={<IconUsers size={20} />}>
                  Collaborate
                </Tabs.Tab>
                <Tabs.Tab value="security" leftSection={<IconLock size={20} />}>
                  Security
                </Tabs.Tab>
                <Tabs.Tab value="download" leftSection={<IconDownload size={20} />}>
                  Download
                </Tabs.Tab>
                <Tabs.Tab value="faqs" leftSection={<IconHelp size={20} />}>
                  FAQs
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>

            <Flex mt={80} mb={50} gap={50} align="center">
              <Image
                src="/placeholder.svg?height=300&width=300"
                alt="AI Composition"
                style={{ flex: 1 }}
                radius="md"
              />
              <div style={{ flex: 2 }}>
                <Group mb="md">
                  <Button variant="subtle" size="compact-sm" color="brand" radius="xl">
                    Premium feature
                  </Button>
                </Group>
                <Title order={2} size={36} mb="md">
                  Make smarter compositions with AI assistance
                </Title>
                <Text c="dimmed" size="lg">
                  Whether you&apos;re a seasoned composer or a budding musician, our intuitive tools empower you to create,
                  edit, and share your compositions with ease. Dive into a world where creativity knows no bounds – collaborate
                  in real time, explore new possibilities, and let your musical dreams take flight.
                </Text>
              </div>
            </Flex>
          </Container>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  )
}