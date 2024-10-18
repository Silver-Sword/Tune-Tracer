'use client'

import React, { useState } from 'react';
import { Container, Center, Title, TextInput, PasswordInput, Stack, Space, Button, rem, Group } from '@mantine/core';
import { IconAt } from '@tabler/icons-react';
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from '../../firebaseSecrets';

const functions = getFunctions(app, "us-central1");


export default function SignUp() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async () => {
        setLoading(true);
        setMessage('');

        // const email2 = email as string;
        // const displayName2 = displayName as string;
        // const password2 = password as string;
        try {
            console.log("Got here tho");
            const signUpUser = await httpsCallable(functions, 'signUpUser');
            
            await signUpUser({email: email as string, password: password as string, displayName: displayName as string})
                .then((result) => {
                    console.log("GOT HERE");
                    // Read result of the Cloud Function.
                    const data = result.data;
                    console.log("Data:" + data);
                    
                }).catch((error) => {
                    // Getting the Error details.
                    const message = error.message;
                    console.log(`Error: ${message}`);
                    setMessage(`Error: ${message}`);
                    return;
                    // ...
                  });

                  setMessage(`User registered successfully. Please check email to get verified`);
        } catch (error: any) {
            console.log(`Error: ${error.message}`);
            // Handle any error and display the message
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

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
                    value={email}
                    onChange={(event) => setEmail(event.currentTarget.value)}
                />
                    <TextInput
                        withAsterisk
                        radius='md'
                        label='Display Name'
                        placeholder='Name'
                        value={displayName}
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
                    />
                    <Button component='a' onClick={handleRegister}>Sign Up</Button>
                </Stack>
            </Container>
        </Group>
    );
}