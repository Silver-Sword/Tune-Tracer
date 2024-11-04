'use client'

import {
  Anchor,
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
  UnstyledButton,
} from '@mantine/core'
import { IconMusic, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import {
  ContentSectionLeftText,
  ContentSectionRightText,
  ContentSectionVertical,
} from '../components/LandingPageContent'

import '@mantine/core/styles.css';
import './global.css'; //Uncomment if you need custom global styles
const theme = createTheme({
  colors: {
    brand: [
      '#E3F2FD',
      '#BBDEFB',
      '#90CAF9',
      '#64B5F6',
      '#42A5F5',
      '#228be6', // Primary color
      '#1E7AC5', // Slightly darker for hover
      '#1565C0',
      '#0D47A1',
      '#0A2472',
    ],
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
  primaryColor: 'brand',
})

const sections = [
  { id: 'compose', label: 'Compose' },
  { id: 'store', label: 'Store' },
  { id: 'collaborate', label: 'Collaborate' },
  { id: 'playback', label: 'Playback' },
  // { id: 'security', label: 'Security' },
  { id: 'faqs', label: 'FAQs' },
]

const faqs = [
  {
    question: 'Can I collaborate with other musicians in real-time?',
    answer: 'Yes! Multiple musicians can work on the same composition simultaneously, with changes syncing instantly. Up to 5 composers can collaborate in real-time.',
  },
  {
    question: 'Is my music protected and secure?',
    answer: 'Absolutely. We use enterprise-grade encryption to protect your compositions. You have full control over sharing permissions and can revoke access at any time.',
  },
  {
    question: 'Do you offer a free trial?',
    answer: 'Our whole product is free, and you get full access to all features. No credit card required!',
  },
]

export default function LandingPage() {
  const [isSubHeaderSticky, setIsSubHeaderSticky] = useState(false)
  const [allExpanded, setAllExpanded] = useState(false)

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
            <Group style={{ textDecoration: 'none', color: 'inherit' }}>
              {/* <IconMusic size={30} style={{ color: '#228be6' }} /> */}
              <Image
                  src="/logo192.png"
                  alt="Tune Tracer Logo"
                  h={40}
                  w="auto"
                />
              <Text size="xl" fw={700}>
                Tune Tracer
              </Text>
            </Group>
            <Group>
              <Button component={Link} href="/signup" variant="outline" color="brand">
                Join Tune Tracer
              </Button>
              <Button component={Link} href="/login" className='landingpage-blue-button'>
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
                    <Button component={Link} href="/login" size="lg" className='landingpage-blue-button'>
                      Sign in
                    </Button>
                    <Button component={Link} href="/signup" size="lg" variant="outline" color="brand">
                      Join Tune Tracer
                    </Button>
                  </Group>
                </div>
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
                description={<Text size="lg" c="dimmed">Whether you're a seasoned composer or a budding musician, our intuitive tools empower you to create, edit, and share your compositions with ease.</Text>}
                imageSrc="/previews/compositionPreview.png"
                imageAlt="Composition Interface"  
                textWidth={7}
              />
            </Box>

            <Box id="store" py={120}>
              <ContentSectionRightText
                title="Store"
                description={<Text size="lg" c="dimmed">Securely store your musical compositions in the cloud, accessible anywhere, anytime. Never worry about losing your creative work again.</Text>}
                imageSrc="/previews/storagePreview.png"
                imageAlt="Cloud Storage"
                textWidth={7}
              />
            </Box>

            <Box id="collaborate" py={120}>
              <ContentSectionLeftText
                title="Collaborate"
                description={<Text size="lg" c="dimmed">Work together in real-time with musicians worldwide. Share ideas, provide feedback, and create beautiful music together.</Text>}
                // imageSrc="/placeholder.svg?height=300&width=400"
                // imageAlt="Collaboration Features"
              />
            </Box>

            <Box id="playback" py={120}>
              <ContentSectionRightText
                title="Playback"
                description={<Text size="lg" c="dimmed">Hear the music you create together with our playback software! Get instant feedback on your compositions with highly versatile playback. </Text>}
                imageSrc="/previews/playback.PNG"
                imageAlt="Playback Feature"
              />
            </Box>

            {/* <Box id="security" py={120}>
              <ContentSectionVertical
                title="Security"
                description={<Text size="lg" c="dimmed">Your compositions are protected with enterprise-grade security. Control access and maintain the privacy of your musical creations.</Text>}
                imageSrc="/placeholder.svg?height=300&width=400"
                imageAlt="Security Features"
              />
            </Box> */}

            

            <Box id="faqs" py={120}>
              <Title order={2} size={36} mb="xl" ta="center">
                Frequently Asked Questions
              </Title>
              <Group justify="right" mb="xl">
                <UnstyledButton
                  onClick={() => setAllExpanded(!allExpanded)}
                  style={{
                    color: '#228be6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '16px',
                  }}
                >
                  Expand all
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: '-4px' }}>
                    <IconChevronUp size={14} />
                    <IconChevronDown size={14} style={{ marginTop: '-4px' }} />
                  </Box>
                </UnstyledButton>
              </Group>
              <Accordion
                variant="separated"
                radius="md"
                multiple
                value={allExpanded ? faqs.map((_, index) => `faq-${index}`) : undefined}
                onChange={() => setAllExpanded(false)}
                styles={{
                  item: {
                    borderBottom: '1px solid #eee',
                    '&[dataActive]': {
                      backgroundColor: 'transparent',
                    },
                  },
                  control: {
                    padding: '20px 24px',
                  },
                  chevron: {
                    color: '#228be6',
                    width: 40,
                    height: 40,
                  },
                  label: {
                    fontSize: '24px',
                    fontWeight: 600,
                    color: 'inherit',
                  },
                  panel: {
                    padding: '0 24px 20px 24px',
                  },
                }}
              >
                {faqs.map((faq, index) => (
                  <Accordion.Item key={index} value={`faq-${index}`}>
                    <Accordion.Control>{faq.question}</Accordion.Control>
                    <Accordion.Panel>
                      <Text size="lg" c="dimmed">{faq.answer}</Text>
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