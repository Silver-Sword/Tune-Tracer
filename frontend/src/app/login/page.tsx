'use client'

import React, { useState } from "react";
import { Title, Center, Container, Button, Stack, rem, Text, Box } from '@mantine/core';
import { useRouter } from "next/navigation";
import { saveUserID, saveDisplayName, saveEmail } from "../cookie";
import { AuthInput } from "../../components/AuthInput";
import { authStyles } from '../../styles/auth-styles';
import { callAPI } from "../../utils/callAPI";

export default function Login() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isShaking, setIsShaking] = useState(false);
    const router = useRouter();

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

            if(email === '' || password === '') 
            {
                triggerError(`${email === '' ? "Email" : "Password"} is a required field`);
                return;
            }

            await callAPI('logInUser', loginInfo)
                .then((res) => {
                    if (res.status == 500) {
                        triggerError('Incorrect username or password');
                    } else if (res.status == 200) {
                        const data = res.data as { user_id: string, display_name: string, user_email: string };
                        saveUserID(data.user_id);
                        saveDisplayName(data.display_name);
                        saveEmail(data.user_email);
                        router.push('/storage');
                    }
                }).catch((error) => {
                    console.log(`Error: ${error.message}`);
                    triggerError('An error occurred. Please try again.');
                });
        } catch (error: any) {
            console.log(`Error: ${error.message}`);
            triggerError('An error occurred. Please try again.');
        }
    }

    return (
        <Container fluid style={authStyles.container}>
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
                        <AuthInput
                            type='text'
                            label='Email'
                            placeholder='email'
                            value={email}
                            onChange={(event) => setEmail(event.currentTarget.value)}
                            isShaking={isShaking}
                        />
                        <AuthInput
                            type='password'
                            label='Password'
                            placeholder='password'
                            value={password}
                            onChange={(event) => setPassword(event.currentTarget.value)}
                            isShaking={isShaking}
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