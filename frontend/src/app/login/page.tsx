'use client'

import React, { useState } from "react";
import { Title, Center, Container, TextInput, PasswordInput, Button, Stack, rem, Text, Box } from '@mantine/core';
import { IconAt } from '@tabler/icons-react';
import { useRouter } from "next/navigation";
import { saveUserID, saveDisplayName, saveEmail } from "../cookie";

const LOGIN_URL = "https://us-central1-l17-tune-tracer.cloudfunctions.net/logInUser";

export default function Login() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isShaking, setIsShaking] = useState(false);
    const router = useRouter();

    const icon = <IconAt style={{ width: rem(16), height: rem(16) }} />;

    const triggerError = async (errorMessage: string) => {
        setError(errorMessage);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    }
    const handleLogin = async () => {
        try {
            const loginInfo = {
                email: email,
                password: password
            };
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginInfo),
            }

            if(email === '' || password === '') 
            {
                triggerError(`${email === '' ? "Email" : "Password"} is a required field`);
                return;
            }

            await fetch(LOGIN_URL, requestOptions)
                .then((res) => {
                    if (res.status == 500) {
                        triggerError('Incorrect username or password');
                    } else if (res.status == 200) {
                        const json = res.json()
                            .then((value) => {
                                // Save the userID as a cookie
                                saveUserID(value['data'].user_id);
                                saveDisplayName(value['data'].display_name);
                                saveEmail(value['data'].user_email);
                            });
                        router.push('/storage');
                    }
                }).catch((error) => {
                    console.log(`Error: ${error.message}`);
                    triggerError('An error occurred. Please try again.');
                })

        } catch (error: any) {
            console.log(`Error: ${error.message}`);
            triggerError('An error occurred. Please try again.');
        }
    }

    return (
        <Container fluid style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Box
                style={{
                    width: '100%',
                    maxWidth: '450px',
                    minHeight: '550px',
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                }}
            >
                <Box
                    style={{
                        background: '#228be6',
                        padding: '3rem 2rem',
                        marginBottom: '2rem',
                    }}
                >
                    <Center>
                        <Title style={{ color: 'white' }}>Welcome Back</Title>
                    </Center>
                </Box>
                <Container style={{ padding: '0 2rem 2rem' }}>
                    <Stack
                        align='stretch'
                        justify='center'
                        gap='md'
                    >
                        <TextInput
                            leftSectionPointerEvents='none'
                            radius='xl'
                            label='Email'
                            placeholder='email'
                            value={email}
                            onChange={(event) => setEmail(event.currentTarget.value)}
                            styles={{
                                label: {
                                    animation: 'none',
                                },
                            }}
                        />
                        <PasswordInput
                            radius='xl'
                            label='Password'
                            placeholder='password'
                            value={password}
                            onChange={(event) => setPassword(event.currentTarget.value)}
                            styles={{
                                label: {
                                    animation: 'none',
                                },
                            }}
                        />
                        <Text size="sm" style={{ textAlign: 'right' }}>
                            Forgot {' '}
                            <Text
                                component="a"
                                href="/signup"
                                className="forgot-link"
                            >
                                Username / Password
                            </Text>
                            ?
                        </Text>
                        <Button 
                            onClick={handleLogin} 
                            radius="xl" 
                            style={{ marginTop: '1rem' }}
                            className={`${isShaking ? 'shake-input' : ''} login-button`}
                        >
                            Login
                        </Button>
                        {
                            error !== '' && (
                                <Text color="red" size="sm" style={{ marginTop: '0.25rem' }}>
                                    {error}
                                </Text>
                            )
                        }
                        <Text
                            c="dimmed"
                            size="sm"
                            style={{ textAlign: 'center', marginTop: '2rem' }}
                        >
                            Don't have an account?
                            <br />
                            <Text
                                component="a"
                                href="/signup"
                                className="signup-link"
                            >
                                SIGN UP NOW
                            </Text>
                        </Text>
                    </Stack>
                </Container>
            </Box>
        </Container>
    );
}