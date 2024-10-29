import { AppShell, Avatar, Button, Divider, Group, Paper, ScrollArea, Space, Stack, TextInput, Text } from "@mantine/core";
import React, { useState } from "react";

// CommentCard component only used for the comment sidebar
const CommentCard: React.FC = () => {
    return (
        <Paper withBorder shadow="sm" p="md" radius="md">
            <Group>
                {/* Need user logic for avatars, names, and date*/}
                <Avatar radius="xl" />
                <div>
                    <Text fz="sm">[name]</Text>
                    <Text fz="xs" c="dimmed">
                        [date/time]
                    </Text>
                </div>
            </Group>
            <Text pl={54} pt="sm" size="sm">
                Lorem ipsum
            </Text>
        </Paper>
    );
};

// Right sidebar that contains all the comments in the document
const CommentAside: React.FC = () => {
    const [commentInput, setCommentInput] = useState("");

    const handleComment = (event: { currentTarget: { value: any } }) => {
        const value = event.currentTarget.value;
        setCommentInput(value);
        console.log(`Comment Published: ${value}`);
        // Add more comment publishing logic here
    };

    const handleClear = () => {
        setCommentInput("");
    };

    return (
        <AppShell.Aside withBorder p="md">
            <Paper withBorder shadow="sm" p="md" radius="md">
                <Stack gap="xs">
                    <TextInput
                        value={commentInput}
                        onChange={(event) => setCommentInput(event.currentTarget.value)}
                    ></TextInput>
                    <Group>
                        <Button color="red" onClick={handleClear}>
                            Clear
                        </Button>
                        <Button onClick={handleComment}>Add Comment</Button>
                    </Group>
                </Stack>
            </Paper>
            <Space h="xs"></Space>
            <Divider size="sm" />
            <Space h="xs"></Space>
            <ScrollArea scrollbarSize={4}>
                <Stack gap="xs">
                    <CommentCard />
                    <CommentCard />
                    <CommentCard />
                    <CommentCard />
                    <CommentCard />
                    <CommentCard />
                    <CommentCard />
                    <CommentCard />
                    <CommentCard />
                </Stack>
            </ScrollArea>
            <Space h="xs"></Space>
        </AppShell.Aside>
    );
};