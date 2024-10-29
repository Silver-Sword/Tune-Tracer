'use client'

import React, { useState } from 'react';
import { Container, Center, Title, Stack, Button, Text, Box } from '@mantine/core';
import { useRouter } from "next/navigation";
import { AuthInput } from '../../components/AuthInput';
import { authStyles, shakeAnimation } from '../../styles/auth-styles';

const SIGN_UP_URL = "https://us-central1-l17-tune-tracer.cloudfunctions.net/signUpUser";

export default function SignUp() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [checkPassword, setCheckPassword] = useState('');
    const [error, setError] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        setError('');
        setLoading(true);
        if (password !== checkPassword) {
            setError('Passwords do not match');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 820);
            setLoading(false);
            return;
        }

        try {
            const userInfo = {
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

            const res = await fetch(SIGN_UP_URL, requestOptions);
            const value = await res.json();
            if (value['message'] !== "User signed up successfully") {
                setError(value['message']);
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 820);
            } else {
                router.push('/login');
            }
        } catch (error: any) {
            console.log(`Error: ${error.message}`);
            setError(`Error: ${error.message}`);
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 820);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid style={authStyles.container}>
            <Box style={authStyles.formBox}>
                <Box style={authStyles.titleBox}>
                    <Center>
                        <Title style={{ color: 'white' }}>Hello there</Title>
                    </Center>
                </Box>
                <Container style={authStyles.formContainer}>
                    <Stack
                        align='stretch'
                        justify='center'
                        gap='md'
                    >
                        <AuthInput
                            type="text"
                            label="Email"
                            placeholder="email"
                            value={email}
                            onChange={(event) => setEmail(event.currentTarget.value)}
                            isShaking={isShaking}
                        />
                        <AuthInput
                            type="text"
                            label="Display Name"
                            placeholder="Name"
                            value={displayName}
                            onChange={(event) => setDisplayName(event.currentTarget.value)}
                            isShaking={isShaking}
                        />
                        <AuthInput
                            type="password"
                            label="Password"
                            placeholder="password"
                            value={password}
                            onChange={(event) => setPassword(event.currentTarget.value)}
                            isShaking={isShaking}
                        />
                        <AuthInput
                            type="password"
                            label="Confirm Password"
                            placeholder="confirm password"
                            value={checkPassword}
                            onChange={(event) => setCheckPassword(event.currentTarget.value)}
                            isShaking={isShaking}
                        />
                        <Button 
                            onClick={handleRegister} 
                            radius="xl" 
                            style={{ marginTop: '1rem' }}
                            className={`${isShaking ? 'shake-input' : ''} login-button`}
                            loading={loading}
                        >
                            Sign Up
                        </Button>
                        {error && (
                            <Text color="red" size="sm" style={{ marginTop: '0.25rem' }}>
                                {error}
                            </Text>
                        )}
                        <Text
                            c="dimmed"
                            size="sm"
                            style={{ textAlign: 'center', marginTop: '2rem' }}
                        >
                            Already have an account?
                            <br />
                            <Text
                                component="a"
                                href="/login"
                                className="login-link"
                            >
                                LOGIN NOW
                            </Text>
                        </Text>
                    </Stack>
                </Container>
            </Box>
        </Container>
    );
}