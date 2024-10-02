'use client'

import React from 'react';
import { Container, Center, Title, TextInput, PasswordInput, Stack, Space, Button, rem, Group } from '@mantine/core';
import { IconAt } from '@tabler/icons-react';

export default function SignUp() {
    const icon = <IconAt style={{ width: rem(16), height: rem(16) }} />;
    const [error, setError] = React.useState('');
    const props = {
        width: '50vw',
        height: '100vh',
        margin: 0,
    };

    // Add data fetching for the login and sign up 
    return (
        <Group
            style={{
                height: '100vh',
                width: '100vw'
            }}
        >
            <Container
                style={{
                    height: '100vh',
                    width: '50vw',
                    margin: 0,
                    background: 'linear-gradient(180deg, rgba(154,215,255,1) 0%, rgba(0,105,182,1) 100%)'
                }}
            >
            </Container>
            <Container
                style={{
                    width: '45vw',
                }}
            >
                <Center>
                    <Title>Hello there</Title>
                </Center>
                <Space h='md'></Space>
                <Stack
                    align='stretch'
                    justify='center'
                    gap='md'
                >
                    <TextInput
                        leftSection={icon}
                        leftSectionPointerEvents='none'
                        withAsterisk
                        radius='md'
                        label='Email'
                        placeholder='email'
                    />
                    <TextInput
                        withAsterisk
                        radius='md'
                        label='Display Name'
                        placeholder='Name'
                    />
                    <PasswordInput
                        radius='md'
                        label='Password'
                        placeholder='password'
                        withAsterisk
                        error={error}
                    />
                    <PasswordInput
                        radius='md'
                        label='Confirm Password'
                        placeholder='password'
                        withAsterisk
                        error={error}
                    />
                    <Button component='a' href='/edit'>Sign Up</Button>
                </Stack>
            </Container>
        </Group>
    );
}