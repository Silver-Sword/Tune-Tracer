'use client'

import React, { useState } from 'react';
import { AppShell, Container, Text, Button, Grid, Image, Title, Center, Group, Space } from '@mantine/core';

export default function LandingPage() {
    return (
        <AppShell
            padding='md'
            header={{ height: 60 }}
        >
            <AppShell.Header
                style={{
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Group justify='space-between' px='lg'>
                    <Text>Tune Tracer</Text>
                    <Group>
                        <Button component='a' href='/login'>Login</Button>
                        <Button component='a' href='/signup'>Sign Up</Button>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Main>
                {/* Hero Section */}
                <Container
                    fluid
                    style={{
                        height: '70vh',
                        weight: '100vw',
                        justifyContent: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'center',
                        background: 'linear-gradient(180deg, rgba(154,215,255,1) 0%, rgba(0,105,182,1) 100%)'
                    }}
                >
                    <Center>
                        <Title textWrap='wrap'>Turn your Inspiration into Notation</Title>
                    </Center>
                </Container>

                <Space h='xl'></Space>

                {/* Blurb */}
                <Container size='xl'>
                    <Grid justify='space-between'>
                        <Grid.Col span={4}>
                            <Text>Welcome to Tune Tracer, where music composition meets innovation and collaboration. Our platform transforms your musical ideas into beautiful sheet music, effortlessly saved to the cloud. Whether you're a seasoned composer or a budding musician, our intuitive tools empower you to create, edit, and share your compositions with ease. Dive into a world where creativity knows no bounds – collaborate in real time, explore new possibilities, and let your musical dreams take flight. Join us today and start making music that resonates.</Text>
                        </Grid.Col>
                        <Grid.Col span={7}>
                            <Image
                                src='https://placehold.co/600x400'
                                alt='Placeholder Image'
                            />
                        </Grid.Col>
                    </Grid>
                </Container>
            </AppShell.Main>
        </AppShell>
    );
}