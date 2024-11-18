'use client'

import React, { useEffect, useState } from "react";
import { Title, Center, Container, Button, Stack, rem, Text, TextInput, Box, Modal } from '@mantine/core';
import { useRouter } from "next/navigation";
import { saveUserID, saveDisplayName, saveEmail, getUserID, saveCursorColor } from "../cookie";
import { AuthInput } from "../../components/AuthInput";
import { authStyles } from '../../styles/auth-styles';
import { callAPI } from "../../utils/callAPI";
import { getRandomColor } from './color';
import { set } from "date-fns";

export default function Login() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isShaking, setIsShaking] = useState(false);
    const router = useRouter();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [notifModal, setNotifModal] = useState(false);
    const [resetError, setResetError] = useState<string>('');

    const triggerError = async (errorMessage: string) => {
        setError(errorMessage);
        setIsShaking(true);
        setIsLoggingIn(false);
        setTimeout(() => setIsShaking(false), 500);
    }

    useEffect(() => {
        if(getUserID() !== '-1'){
            router.push("/storage");
        }
    }, []);

    const handleLogin = async () => {
        try {
            const loginInfo = {
                email: email,
                password: password
            };
            setIsLoggingIn(true);

            if (email === '' || password === '') {
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
                        saveCursorColor(getRandomColor());
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

    const handleForgotPassword = async () => {
        console.log(`Resetting password for: ${resetEmail}`);
        try
        {
            await callAPI("resetUserPassword", {email: resetEmail})
                .then((res) => {
                    if (res.status == 400) {
                        setResetError("Please enter a valid email address.");
                        throw new Error("Enter an email address");
                    }
                    else if (res.status == 500) {
                        setResetError("Error resetting password. Please try again.");
                        throw new Error("Error resetting password");
                    }
                    
                    setNotifModal(false);
                    setPasswordModal(true);
                    console.log(JSON.stringify(res.data));
                }).catch((error) => {
                    console.log(`Error resetting password for: ${resetEmail}`);
                    setResetError("Error resetting password. Please try again.");
                    return;
                });
            }
        catch (error)
        {
            console.log(`Error resetting password for: ${resetEmail}`);
            return;
        }
    }

    const [passwordModal, setPasswordModal] = useState(false);
    const closeNotifModal = () => { 
        setNotifModal(false); 
        setResetError('');
        setResetEmail('');
    }
    const openNotifModal = () => { setNotifModal(true); }
    const closePassSentModal = () => { setPasswordModal(false); }

    const [resetEmail, setResetEmail] = useState<string>('');


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
                        <Text size="sm" style={{ textAlign: 'right', cursor: "pointer"}}>
                            Forgot {' '}
                            <Text
                                component="a"
                                className="forgot-link"
                                onClick={openNotifModal}
                            >
                                Password
                            </Text>
                            ?
                        </Text>
                        <Button
                            loading = {isLoggingIn}
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
            <Modal
                opened={notifModal}
                onClose={closeNotifModal}
                centered
            >
                <Box style={{ padding: '20px', textAlign: 'center' }}>
                    <Text size="lg" style={{ marginBottom: '20px' }}>
                        Reset Password
                    </Text>
                    <Text style={{ marginBottom: '20px' }}>
                        Enter your email to reset your password
                    </Text>
                    <TextInput
                        label="Email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(event) => setResetEmail(event.currentTarget.value)}
                        error={resetError !== ''} // Conditionally apply error state
                        style={{
                            borderColor: resetError !== '' ? 'red' : undefined, // Apply red border if there's an error
                        }}
                    />
                    {resetError && (
                        <Text color="red" size="sm" style={{ marginTop: '10px' }}>
                            {resetError}
                        </Text>
                    )}
                    <Button onClick={handleForgotPassword} color="blue" style={{ marginTop: '20px' }}>
                        Send
                    </Button>
                </Box>
            </Modal>

            <Modal
                opened={passwordModal}
                onClose={closePassSentModal}
                centered
            >
                <Box style={{ padding: '20px', textAlign: 'center' }}>
                    <Text size="lg" style={{ marginBottom: '20px' }}>
                        Success!
                    </Text>
                    <Text style={{ marginBottom: '20px' }}>
                        Please check your email for further instructions.
                    </Text>
                    <Button
                        onClick={closePassSentModal}
                        color="blue"
                        style={{ marginTop: '20px' }}
                    >
                        Close
                    </Button>
                </Box>
            </Modal> 
    
        </Container>
    );
}