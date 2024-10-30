import { Flex, Image, Text, Title } from '@mantine/core'
import React from 'react';

interface ContentSectionProps {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
}

export function ContentSectionLeftText({ title, description, imageSrc, imageAlt }: ContentSectionProps) {
  return (
    <Flex gap={50} align="center">
      <div style={{ flex: 1 }}>
        <Title order={2} size={36} mb="xl">
          {title}
        </Title>
        <Text size="lg">{description}</Text>
      </div>
      <Image src={imageSrc} alt={imageAlt} style={{ flex: 1 }} radius="md" />
    </Flex>
  )
}

export function ContentSectionRightText({ title, description, imageSrc, imageAlt }: ContentSectionProps) {
  return (
    <Flex gap={50} align="center">
      <Image src={imageSrc} alt={imageAlt} style={{ flex: 1 }} radius="md" />
      <div style={{ flex: 1 }}>
        <Title order={2} size={36} mb="xl">
          {title}
        </Title>
        <Text size="lg">{description}</Text>
      </div>
    </Flex>
  )
}

export function ContentSectionVertical({ title, description, imageSrc, imageAlt }: ContentSectionProps) {
  return (
    <Flex direction="column" gap={50} align="center">
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <Title order={2} size={36} mb="xl" ta="center">
          {title}
        </Title>
        <Text size="lg" ta="center">
          {description}
        </Text>
      </div>
      <Image src={imageSrc} alt={imageAlt} style={{ width: '100%', maxWidth: '800px' }} radius="md" />
    </Flex>
  )
}