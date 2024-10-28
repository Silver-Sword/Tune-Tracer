'use client'

import React, { useState } from 'react';
import { Container, Center, Title, TextInput, PasswordInput, Stack, Space, Button, rem, Group, Text } from '@mantine/core';
import { IconAt } from '@tabler/icons-react';
import { useRouter } from "next/navigation";

const SIGN_UP_URL = "https://us-central1-l17-tune-tracer.cloudfunctions.net/signUpUser";


export default function SignUp() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [checkPassword, setCheckPassword] = useState('');
    const router = useRouter();
    

    const handleRegister = async () => {
        setError('');
        setLoading(true);
        if (password !== checkPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const userInfo =
            {
                email: email,
                password: password, 
                displayName: displayName
            }
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userInfo),
            }

            fetch(SIGN_UP_URL, requestOptions)
               .then((res) => {
                    res.json().then((value) => {
                        if (value['message'] !== "User signed up successfully")
                        {
                            setError(value['message']);
                            return;
                        }
                        else
                        {
                            router.push('/login');
                        }
                    // Save the userID as a cookie
                    });
                }).catch((error) => {
                    // Getting the Error details.
                    const message = error.message;
                    console.log(`Error: ${message}`);
                    setError(`Error: ${message}`);
                    return;
                    // ...
                  });
        } catch (error: any) {
            console.log(`Error: ${error.message}`);
            // Handle any error and display the message
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const icon = <IconAt style={{ width: rem(16), height: rem(16) }} />;
    const [error, setError] = useState("");
    
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
                        error={error}
                    value={email}
                    onChange={(event) => setEmail(event.currentTarget.value)}
                />
                    <TextInput
                        withAsterisk
                        radius='md'
                        label='Display Name'
                        placeholder='Name'
                        value={displayName}
                        error={error}
                    onChange={(event) => setDisplayName(event.currentTarget.value)}
                    />
                    <PasswordInput
                        radius='md'
                        label='Password'
                        placeholder='password'
                        withAsterisk
                        error={error}
                        value={password}
                        onChange={(event) => setPassword(event.currentTarget.value)}
                    />
                    <PasswordInput
                        radius='md'
                        label='Confirm Password'
                        placeholder='password'
                        withAsterisk
                        error={error}
                        onChange={(event) => setCheckPassword(event.currentTarget.value)}
                    />
                    <Button component='a' onClick={handleRegister}>Sign Up</Button>
                    <Text
                        c="dimmed"
                        size="sm"
                        component="a"
                        href="/login"
                    >
                        Already have an account? Login here.
                    </Text>
                </Stack>
            </Container>
        </Group>
    );
}