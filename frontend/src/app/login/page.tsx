'use client'

import React, { useState } from "react";
import { Title, Center, Group, Container, TextInput, PasswordInput, Button, Space, Stack, rem } from '@mantine/core';
import { IconAt } from '@tabler/icons-react';
import { useRouter } from "next/navigation";
import { saveUserID } from "../cookie";

const LOGIN_URL = "https://us-central1-l17-tune-tracer.cloudfunctions.net/logInUser";

export default function Login() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const router = useRouter();

    const icon = <IconAt style={{ width: rem(16), height: rem(16) }} />;

    const handleLogin = async () => {
        try {
            const loginInfo = 
            {
                email: email,
                password: password
            };
            const requestOptions = 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginInfo),
            }

            fetch(LOGIN_URL, requestOptions)
                .then((res) => {
                    const data = res;
                    if (data && data.status == 200)
                    {
                        const json = data.json()
                            .then((value) => {
                                // Save the userID as a cookie
                                saveUserID(value['data'].user_id);
                            })
                    }
                    router.push('/storage');
                }).catch((error) => {
                    console.log(`Error: ${error.message}`);
                })

        }
        catch (error: any) {
            console.log(`Error: ${error.message}`);
        }
    }

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
                        value={email}
                        onChange={(event) => setEmail(event.currentTarget.value)}
                    />
                    <PasswordInput
                        radius='md'
                        label='Password'
                        placeholder='password'
                        value={password}
                        onChange={(event) => setPassword(event.currentTarget.value)}
                    />

                    <Button onClick={handleLogin}>Login</Button>
                </Stack>
            </Container>
        </Group>
    );
}