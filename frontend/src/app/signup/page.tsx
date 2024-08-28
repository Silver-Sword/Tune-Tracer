'use client'

import React from 'react';
import { Container, Center, Title, TextInput, PasswordInput, Stack, Space, Button, rem } from '@mantine/core';
import { IconAt } from '@tabler/icons-react';

export default function Page() {
    const icon = <IconAt style={{ width: rem(16), height: rem(16) }} />;
    const [error, setError] = React.useState('');

    return (
        <Container>
            <Center>
                <Title>THIS IS THE SIGN UP PAGE</Title>
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
                <Button onClick={() => setError('Passwords do not match')}>Sign Up</Button>
            </Stack>
        </Container>
    );
}