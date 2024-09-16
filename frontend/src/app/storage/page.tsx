'use client'

import React, { useState } from 'react';
import { AppShell, Container, Text, Button, Grid, Image, Title, Center, Group, Space, TextInput, Skeleton, Code } from '@mantine/core';
// import classes from './NavbarSimple.module.css';

const filterLabels = [
    'All',
    'Shared with you',
    'Favorites',
    'Recents',
    'A-Z',
];


export default function storage() {
    const [active, setActive] = useState('All');
    
    // const tabs = filterLabels.map((item)) =>


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
                <Group justify='space-between'>
                    <Text>Tune Tracer</Text>

                    <TextInput
                    variant="filled"
                    size="sm"
                    radius="xl"
                    placeholder="Search compositions"
                   />

                    <Button component='a' href='/login'>Profile</Button>

                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="xl">
                Filters WIP
                {
                // Array(5)
                // .fill(0)
                filterLabels.map((_, index) => (
                    <Skeleton key={index} h={28} mt="xl" animate={false} />
                ))}
            </AppShell.Navbar>


            {/* Placeholder  */}
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
                </Container>

                <Space h='xl'></Space>

                {/* Blurb */}
                <Container size='xl'>
                    <Grid justify='space-between'>
                        <Grid.Col span={4}>
                            <Text>Welcome to Tune Tracer, where music composition meets innovation and collaboration. Our platform transforms your musical ideas into beautiful sheet music, effortlessly saved to the cloud. Whether you're a seasoned composer or a budding musician, our intuitive tools empower you to create, edit, and share your compositions with ease. Dive into a world where creativity knows no bounds – collaborate in real time, explore new possibilities, and let your musical dreams take flight. Join us today and start making music that resonates.</Text>
                        </Grid.Col>
                        <Grid.Col span={7}>
                            
                        </Grid.Col>
                    </Grid>
                </Container>
            </AppShell.Main>
        </AppShell>
    );
}