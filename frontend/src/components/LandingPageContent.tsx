import { Box, Flex, Image, Title } from '@mantine/core'
import React, { ReactNode } from 'react'

interface ContentSectionProps {
  title: string
  description: ReactNode
  imageSrc: string
  imageAlt: string
  textWidth?: number // Value between 1-11, default is 6 (half)
}

export function ContentSectionLeftText({ title, description, imageSrc, imageAlt, textWidth = 6 }: ContentSectionProps) {
  const imageWidth = 12 - textWidth
  return (
    <Flex gap={50} align="center">
      <Box style={{ flex: textWidth }}>
        <Title order={2} size={36} mb="xl">
          {title}
        </Title>
        {description}
      </Box>
      <Image 
        src={imageSrc} 
        alt={imageAlt} 
        style={{
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
          borderRadius: '8px', // Optional: rounded corners
          flex: imageWidth
        }}
        radius="md" />
    </Flex>
  )
}

export function ContentSectionRightText({ title, description, imageSrc, imageAlt, textWidth = 6 }: ContentSectionProps) {
  const imageWidth = 12 - textWidth
  return (
    <Flex gap={50} align="center">
      <Image 
        src={imageSrc} 
        alt={imageAlt} 
        style={{
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
          borderRadius: '8px', // Optional: rounded corners
          flex: imageWidth 
        }} 
        radius="md" />
      <Box style={{ flex: textWidth }}>
        <Title order={2} size={36} mb="xl">
          {title}
        </Title>
        {description}
      </Box>
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
        <div style={{ textAlign: 'center' }}>{description}</div>
      </div>
      <Image src={imageSrc} alt={imageAlt} style={{ width: '100%', maxWidth: '800px' }} radius="md" />
    </Flex>
  )
}