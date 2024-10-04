import React, { useState } from "react";
import { Title, Center, Group, Container, TextInput, PasswordInput, Button, Space, Stack, rem } from '@mantine/core';
import { IconAt } from '@tabler/icons-react';
import { signUp } from '../../../../functions/src/backend/src/endpoints/loginEndpoints.ts'

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const icon = <IconAt style={{ width: rem(16), height: rem(16) }} />;

    const handleRegister = async () => {
        setLoading(true);
        setMessage('');

        try {
            // Firebase Authentication API call to create a new user
            const userCredential = await signUp(email, password, displayName);

            setMessage(`User registered successfully. Please check email to get verified`);
        } catch (error: any) {
            // Handle error and display the message
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };


    return (
        <Group style={{
            height: '100vh',
            width: '100vw'
        }}>
            <Container style={{
                height: '100vh',
                width: '50vw',
                margin: 0,
                background: 'linear-gradient(180deg, rgba(154,215,255,1) 0%, rgba(0,105,182,1) 100%)'
            }}
            >
            </Container>
            <Container style={{
                width: '45vw'
            }}
            >
                <Center>
                    <Title>Welcome back</Title>
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
                        radius='md'
                        label='Email'
                        placeholder='email'
                    />
                    <PasswordInput
                        radius='md'
                        label='Password'
                        placeholder='password'
                    />

                    <Button component='a' href='/storage'>Login</Button>
                </Stack>
            </Container>
        </Group>
    );
}