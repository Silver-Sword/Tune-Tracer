import React from 'react';
import { Title, Center, Container, TextInput, PasswordInput, Button, Space, Stack, rem } from '@mantine/core';
import { IconAt } from '@tabler/icons-react';

export default function Page() {
    const icon = <IconAt style={{ width: rem(16), height: rem(16) }} />;
    return (
        <Container>
            <Center>
                <Title>THIS IS THE LOGIN PAGE</Title>
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
                <Button>Login</Button>
            </Stack>
        </Container>
    );
}