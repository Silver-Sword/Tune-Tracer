import React from 'react';
import { Container, Title, Text, Center, Group, Button, Space } from '@mantine/core';

export default function Page() {
    return (
        <Container>
            <Center>
                <Title>WELCOME TO TUNE TRACER</Title>
            </Center>
            <Space h='sm'></Space>
            <Group justify="center">
                <Button component='a' href='/login'>Login</Button>
                <Button component='a' href='/signup'>Sign Up</Button>
            </Group>
        </Container>
    );
}