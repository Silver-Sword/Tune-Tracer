'use client'

import React, { useState } from 'react';
import { AppShell, Container, Text, Button, Grid, Image, Title, Center, Group, Space, TextInput, Skeleton, Code, rem } from '@mantine/core';
import { IconSearch} from '@tabler/icons-react';
import FiltersNavbar from './FiltersNavbar';
// import classes from 'NavbarSimple.module.css' assert {type: 'css'};

const filterLabels = [
    { link: '', label: 'All'},
    { link: '', label:'Shared with you'},
    { link: '', label:'Favorites'},
    { link: '', label:'Recents'},
    { link: '', label:'A-Z'},
];

export default function storage() {
    const [active, setActive] = useState('All');
    const [value, setValue] = useState('');
    const icon = <IconSearch style={{ width: rem(16), height: rem(16)}} />;
    // const tabs = filterLabels.map((item) => (
    //     <a
    //         className={classes.link}
    //         data-active={item.label === active || undefined }
    //         href = {item.link}
    //         key = {item.label}
    //         onClick={(event) => {
    //             event.preventDefault();
    //             setActive(item.label);
    //         }}
    //     >
    //         <span>{item.label}</span>
    //     </a>
    // ));





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
                <Group justify='space-between' px="lg">
                    <Text>Tune Tracer</Text>
 
                    <TextInput
                    variant="filled"
                    size="sm"
                    radius="xl"
                    placeholder="Search compositions"
                    leftSectionPointerEvents="none"
                    leftSection={icon}

                    value={value}
                    onChange={(event) => setValue(event.currentTarget.value)}
                   />

                    <Button component='a' href='/login'>Profile</Button>

                </Group>
            </AppShell.Header>

            <FiltersNavbar />

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
                </Container>
             </AppShell.Main>
         </AppShell>
    );
}