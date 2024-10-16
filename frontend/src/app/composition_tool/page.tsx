'use client' // IMPORTANT as Vexflow only renders in the DOM

import React, { useEffect, useRef, useState } from 'react';
import { Score } from '../edit/Score';
import {
    AppShell, 
    Container, 
    Text,
    Button,
    Group,
    Space,
    Stack,
    SimpleGrid,
    Grid,
    Flex,
    Input,
    TextInput,
    Paper,
    Avatar,
    Divider,
    ScrollArea,
    Tooltip,
    Tabs,
    SegmentedControl,
    ActionIcon,
    Modal,
    Slider,
    rem,
    Center,
} from "@mantine/core";
import { IconPlayerPlay, IconPlayerPause, IconPlayerStop, IconVolume } from "@tabler/icons-react"
import { useDisclosure } from '@mantine/hooks';

const ToolbarHeader: React.FC = () => {
    // Need logic for setting document name
    
    // Need logic for swapping pause and play buttons, also if hitting stop it completely resets the time back to 0

    const [volume, setVolume] = useState(50);

    const handleVolumeChange = (value: React.SetStateAction<number>) => {
        setVolume(value);
        console.log(`Volume value is: ${value}`);
        // if (audioRef.current) {
        //   audioRef.current.volume = value / 100; // Convert to a scale of 0 to 1 for audio API
        // }
      };

    // Logic for Sharing
    const [ openShare, { open, close }] = useDisclosure(false);
    
    return (
      <AppShell.Header p="md">
        {/* First layer (top section) */}
        <Group align="center" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <Text size="xl" component="a" href="/storage">Tune Tracer</Text>
            <TextInput 
                size="md"
                placeholder="Enter Document Name"
                // value={}
                // onChange={}
            />

            {/* PlayBack UI */}
            <Container fluid style={{ width: '25%' }}>
                <Center>
                <Group> 
                    <ActionIcon>
                        <IconPlayerPlay />
                    </ActionIcon>
                    <ActionIcon>
                        <IconPlayerPause />
                    </ActionIcon>
                    <ActionIcon>
                        <IconPlayerStop />
                    </ActionIcon>
                </Group>
                </Center>
                <Space h="xs"></Space>
                <Slider
                    value={volume}
                    onChange={handleVolumeChange}
                    thumbChildren={<IconVolume/>}
                    label={null}
                    defaultValue={50}
                    thumbSize={26}
                    styles={{ thumb: { borderWidth: rem(2), padding: rem(3)}}}
                />
            </Container>
           
            {/* Sharing UI */}
            <Modal opened={openShare} onClose={close} title="Sharing" centered>
            {/* Modal content */}
            Share??
            </Modal>

            <Button onClick={open}>Share</Button>
            
        </Group>
  
        {/* Second layer (middle section) */}
        <Group align="center" mt="xs" style={{ paddingBottom: '10px' }}>
            <Tabs defaultValue="notes">
                <Tabs.List>
                    <Tabs.Tab value="notes">
                        Notes
                    </Tabs.Tab>
                </Tabs.List>
                
                {/* Notes Tab */}
                <Tabs.Panel value="notes">
                    <Space h="xs"></Space>
                    <Group>
                        <Button variant="outline">Natural</Button>
                        <Button variant="outline">Sharp</Button>
                        <Button variant="outline">Flat</Button>

                        <Divider size="sm" orientation="vertical" />

                        <Button variant="outline">Whole</Button>
                        <Button variant="outline">Half</Button>
                        <Button variant="outline">Quarter</Button>
                        <Button variant="outline">Eighth</Button>
                        <Button variant="outline">Sixteenth</Button>
                        <Button variant="outline">Thirty-Second</Button>
                        <Button variant="outline">Sixty-Fourth</Button>

                        <Divider size="sm" orientation="vertical" />
                        
                        <Button variant="outline">Dot</Button>

                        <Divider size="sm" orientation="vertical" />

                        <Button>Help</Button>
                    </Group>
                </Tabs.Panel>

                
            </Tabs>
        </Group>
      </AppShell.Header>
    );
  };

// CommentCard component only used for the comment sidebar
const CommentCard: React.FC = () => {

    return (
        <Paper withBorder shadow="sm" p="md" radius="md">
            <Group>
                {/* Need user logic for avatars, names, and date*/}
                <Avatar
                radius="xl"/>
                <div>
                    <Text fz="sm">
                        [name]
                    </Text>
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

    const handleComment = (event: { currentTarget: { value: any; }; }) => {
        const value = event.currentTarget.value;
        setCommentInput(value);
        console.log(`Comment Published: ${value}`);
        // Add more comment publishing logic here
    };

    const handleClear = () => {
        setCommentInput('');
    };

    return (
        <AppShell.Aside withBorder p="md">
            <Paper withBorder shadow="sm" p="md" radius="md">
                <Stack gap="xs">
                    <TextInput value={commentInput} onChange={(event) => setCommentInput(event.currentTarget.value)}></TextInput>
                    <Group>
                        <Button color="red" onClick={handleClear}>Clear</Button>
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

const DEFAULT_RENDERER_WIDTH = 1000;
const DEFAULT_RENDERER_HEIGHT = 2000;

export default function CompositionTool() {
    const notationRef = useRef<HTMLDivElement>(null);
    const score = useRef<Score | null>(null);
    
    useEffect(() => {
        const clearSVG = () => {
            if (notationRef.current) {
                notationRef.current.innerHTML = '';
            }
        };

        const renderNotation = () => {
            if (notationRef.current) {
                score.current = new Score(
                    notationRef.current,
                    DEFAULT_RENDERER_HEIGHT,
                    DEFAULT_RENDERER_WIDTH
                );
            }
        };

        clearSVG();
        renderNotation();
    }, []);

    return (
        <AppShell
            
            header={{ height: 175 }}
            navbar={{
                width: 150,
                breakpoint: "sm",
            }}
            aside={{ 
                width: 300, 
                breakpoint: "sm",
            }}
            padding="md"
        >
            <AppShell.Main>
                <ToolbarHeader />
                <CommentAside />
                
                    {/* get rid of the background later, use it for formatting */}
                <Container
                    fluid
                    size="responsive"
                    style={{
                        justifyContent: "center",
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "center",
                        background:
                        "linear-gradient(180deg, rgba(154,215,255,1) 0%, rgba(0,105,182,1) 100%)",
                    }}
                >
                    <Space h="xl"></Space>
                    <Text>Score Name</Text>

                    <div>
                        <div ref={notationRef}></div>
                    </div>
                </Container>
            </AppShell.Main>
        </AppShell>
    );
};
