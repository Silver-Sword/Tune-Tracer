'use client'

import {
  AppShell,
  Button,
  Container,
  Flex,
  Group,
  Image,
  Text,
  Title,
  createTheme,
  MantineProvider,
  Box,
  Accordion,
} from '@mantine/core'
import { IconMusic } from '@tabler/icons-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import React from 'react';
import {
  ContentSectionLeftText,
  ContentSectionRightText,
  ContentSectionVertical,
} from '../components/LandingPageContent'

const theme = createTheme({
  colors: {
    brand: [
      '#E3F2FD',
      '#BBDEFB',
      '#90CAF9',
      '#64B5F6',
      '#42A5F5',
      '#228be6',
      '#1a62a1',
      '#1565C0',
      '#0D47A1',
      '#0A2472',
    ],
  },
  primaryColor: 'brand',
})

const sections = [
  { id: 'compose', label: 'Compose' },
  { id: 'store', label: 'Store' },
  { id: 'collaborate', label: 'Collaborate' },
  { id: 'security', label: 'Security' },
  { id: 'download', label: 'Download' },
  { id: 'faqs', label: 'FAQs' },
]

const faqs = [
  {
    question: "What is Tune Tracer's sheet music recognition accuracy?",
    answer: "Tune Tracer's AI-powered recognition system achieves over 95% accuracy in converting your musical ideas into sheet music, with continuous improvements through machine learning.",
  },
  {
    question: 'Can I collaborate with other musicians in real-time?',
    answer: 'Yes! Multiple musicians can work on the same composition simultaneously, with changes syncing instantly. You can also leave comments and suggestions for other collaborators.',
  },
  {
    question: 'What file formats does Tune Tracer support?',
    answer: 'We support all major music notation formats including MusicXML, MIDI, PDF, and our native format. You can easily import and export your work in these formats.',
  },
  {
    question: 'Is my music protected and secure?',
    answer: 'Absolutely. We use enterprise-grade encryption to protect your compositions. You have full control over sharing permissions and can revoke access at any time.',
  },
  {
    question: 'Do you offer a free trial?',
    answer: 'Yes, we offer a 14-day free trial with full access to all features. No credit card required to start.',
  },
]

export default function LandingPage() {
  const [isSubHeaderSticky, setIsSubHeaderSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero')
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom
        setIsSubHeaderSticky(heroBottom < 0)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = isSubHeaderSticky ? 120 : 60
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      })
    }
  }

  return (
    <MantineProvider theme={theme}>
      <AppShell>
        <AppShell.Header style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Flex h={60} px="md" align="center" justify="space-between">
            <Group>
              <IconMusic size={30} style={{ color: '#228be6' }} />
              <Text size="xl" fw={700}>
                Tune Tracer
              </Text>
            </Group>
            <Group>
              <Button component={Link} href="/signup" variant="outline" color="brand">
                Try Tune Tracer
              </Button>
              <Button component={Link} href="/login" color="brand">
                Sign in
              </Button>
            </Group>
          </Flex>
        </AppShell.Header>

        <AppShell.Main>
          <Container size="xl">
            <Box id="hero" mt={100}>
              <Flex gap={50} align="center" mb={120}>
                <div style={{ flex: 1 }}>
                  <Title order={1} size={48} mb="md">
                    Create and share music online
                  </Title>
                  <Text size="lg" c="dimmed" mb="xl" maw={600}>
                    Welcome to Tune Tracer, where music composition meets innovation and collaboration. Our platform
                    transforms your musical ideas into beautiful sheet music, effortlessly saved to the cloud.
                  </Text>
                  <Group>
                    <Button component={Link} href="/login" size="lg" color="brand">
                      Sign in
                    </Button>
                    <Button component={Link} href="/signup" size="lg" variant="outline" color="brand">
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
            </Box>

            <Box
              style={{
                position: isSubHeaderSticky ? 'fixed' : 'static',
                top: 80,
                left: '50%',
                transform: isSubHeaderSticky ? 'translateX(-50%)' : 'none',
                backgroundColor: 'white',
                borderRadius: '100px',
                zIndex: 1000,
                transition: 'box-shadow 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #eee',
                maxWidth: '800px',
                width: '90%',
                margin: '0 auto',
              }}
            >
              <Group h={50} gap="xl" justify="center">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant="subtle"
                    color="brand"
                    onClick={() => scrollToSection(section.id)}
                  >
                    {section.label}
                  </Button>
                ))}
              </Group>
            </Box>

            <Box id="compose" py={120}>
              <ContentSectionLeftText
                title="Compose"
                description="Whether you're a seasoned composer or a budding musician, our intuitive tools empower you to create, edit, and share your compositions with ease."
                imageSrc="/placeholder.svg?height=300&width=400"
                imageAlt="Composition Interface"
              />
            </Box>

            <Box id="store" py={120}>
              <ContentSectionRightText
                title="Store"
                description="Securely store your musical compositions in the cloud, accessible anywhere, anytime. Never worry about losing your creative work again."
                imageSrc="/placeholder.svg?height=300&width=400"
                imageAlt="Cloud Storage"
              />
            </Box>

            <Box id="collaborate" py={120}>
              <ContentSectionLeftText
                title="Collaborate"
                description="Work together in real-time with musicians worldwide. Share ideas, provide feedback, and create beautiful music together."
                imageSrc="/placeholder.svg?height=300&width=400"
                imageAlt="Collaboration Features"
              />
            </Box>

            <Box id="security" py={120}>
              <ContentSectionRightText
                title="Security"
                description="Your compositions are protected with enterprise-grade security. Control access and maintain the privacy of your musical creations."
                imageSrc="/placeholder.svg?height=300&width=400"
                imageAlt="Security Features"
              />
            </Box>

            <Box id="download" py={120}>
              <ContentSectionVertical
                title="Download"
                description="Export your compositions in various formats, from PDF sheet music to MIDI files. Compatible with major music software."
                imageSrc="/placeholder.svg?height=300&width=400"
                imageAlt="Download Options"
              />
            </Box>

            <Box id="faqs" py={120}>
              <Title order={2} size={36} mb="xl" ta="center">
                Frequently Asked Questions
              </Title>
              <Accordion
                variant="separated"
                radius="md"
                styles={{
                  item: {
                    borderBottom: '1px solid #eee',
                    '&[data-active]': {
                      backgroundColor: 'transparent',
                    },
                  },
                  control: {
                    padding: '20px 0',
                  },
                  chevron: {
                    color: theme?.colors?.brand ? theme.colors.brand[5] : '#228be6',
                    width: 32,
                    height: 32,
                  },
                  label: {
                    fontSize: '24px',
                    fontWeight: 600,
                    color: 'inherit',
                  },
                  panel: {
                    padding: '0 0 20px 0',
                  },
                }}
              >
                {faqs.map((faq, index) => (
                  <Accordion.Item key={index} value={`faq-${index}`}>
                    <Accordion.Control>{faq.question}</Accordion.Control>
                    <Accordion.Panel>
                      <Text size="lg">{faq.answer}</Text>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Box>
          </Container>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  )
}