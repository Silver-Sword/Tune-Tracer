'use client' // IMPORTANT as Vexflow only renders in the DOM

import React, { useEffect, useRef, useState } from 'react';
import { Document } from '../lib/src/Document';
import { ScoreData } from '../lib/src/ScoreData';
import { Comment } from '../lib/src/Comment';
import { DocumentMetadata } from '../lib/src/documentProperties';
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
import * as d3 from 'd3';
import { title } from 'process';

const ToolbarHeader: React.FC<{
    modifyDurationInMeasure: (duration: string, noteId: number) => void;
    selectedNoteId: number;
}> = ({ modifyDurationInMeasure, selectedNoteId }) => {
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
        {/* First layer (top section) PUT IF STATEMENT HERE IF READ ONLY*/}
        <Group align="center" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            {/* <Group align="left"> */}
                <Text size="xl" component="a" href="/storage">Tune Tracer</Text>
                <TextInput 
                    size="md"
                    placeholder="Enter Document Name"
                    // value={}
                    // onChange={}
                />

                {/* PlayBack UI */}
                <Container fluid style={{ width: '40%' }}>
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
                        label={(value) => `${value}%`}
                        defaultValue={50}
                        thumbSize={26}
                        styles={{ thumb: { borderWidth: rem(2), padding: rem(3)}}}
                    />
                </Container>
            {/* </Group> */}
           {/* I'd like to have everything left justified except the sharing button */}

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

                <Button
                    variant="outline"
                    onClick={() => modifyDurationInMeasure('w', selectedNoteId)}
                >
                    Whole
                </Button>
                <Button variant="outline">Half</Button>
                <Button
                    variant="outline"
                    onClick={() => modifyDurationInMeasure('q', selectedNoteId)}
                >
                    Quarter
                </Button>
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
const SUBSCRIBE_TO_DOC_URL = 'https://us-central1-l17-tune-tracer.cloudfunctions.net/subscribeToDocument';
const SUBSCRIBE_TO_COMMENTS_URL = 'https://us-central1-l17-tune-tracer.cloudfunctions.net/subscribeToComments';
const CHECK_CHANGE_URL = 'https://us-central1-l17-tune-tracer.cloudfunctions.net/checkDocumentChanges';


export default function CompositionTool() {
    const notationRef = useRef<HTMLDivElement>(null);
    const score = useRef<Score | null>(null);
    const [selectedNoteId, setSelectedNoteId] = useState<number>(-1);
    const [currentDocument, setDocument] = useState<Document>({
        document_title: '',
        comments: [],
        score: {} as ScoreData,
        metadata: {} as DocumentMetadata
    });
    const [loaded, setLoadState] = useState<boolean>(false);
    const [scoreData, setScoreData] = useState<ScoreData | null>({});
    const [changes, setChanges] = useState<Record<string, unknown>>({});

    const handleScoreNameChange = (event: { currentTarget: { value: string; }; }) => {
        const value = event.currentTarget.value;

        const changesTemp = 
        {
            documentChanges: { score: { title: value } }
        }
        var recordTemp : Record<string, unknown> = changes;
        if (!('score' in recordTemp)) 
        {
            recordTemp['score'] = {title: value};
        }
        else
        {
            (recordTemp['score'] as ScoreData).title = value;
        }

        setChanges(recordTemp);

        const PUT_OPTION = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(changesTemp)
        }
        fetch(CHECK_CHANGE_URL, PUT_OPTION)
            .then((res) => {
                res.json().then((data) => {
                    const compData : ScoreData = (data.data).score;
                    const document_title : string = (data.data).document_title;
                    const comments: Comment[] = (data.data).comments; 
                    const metadata: DocumentMetadata = (data.data).metadata; 
                    const tempDocument : Document = {
                        document_title: document_title,
                        comments: comments,
                        score: compData,
                        metadata: metadata
                    };
                    setDocument(tempDocument);
                }).catch((error) => {
                    // Getting the Error details.
                    const message = error.message;
                    console.log(`Error: ${message}`);
                    return;
                });;
            });
    }
    
    // Wrapper function to call modifyDurationInMeasure with the score object
    const modifyDurationHandler = (duration: string, noteId: number) => {
        if (score && score.current)
        {
            score.current.modifyDurationInMeasure(duration, noteId);
        }
    }

    // Wrapper function to call addNoteInMeasure
    const addNoteHandler = (notes: string[], noteId: number) => {
        if (score && score.current)
        {
            score.current.addNoteInMeasure(notes, noteId);
            setSelectedNoteId(noteId);

            // Manually reapply the 'selected-note' class
            const noteElement = document.getElementById(noteId.toString());
            if (noteElement)
            {
                noteElement.classList.add('selected-note');
            }
        }
    }
    const [userTemp, setUserTemp] = useState("");

    const handleUserIdChange = (event: { currentTarget: { value: string; }; }) => {
        const value = event.currentTarget.value;
        setUserTemp(value);
    };

    // for networking
    useEffect(() => {
        if (!loaded && userTemp !== '') {
            var userInfo;
            if (userTemp === '1')
            {
                userInfo = {
                    documentId: 'LbYvc1LonALQpleCAURt',
                    userId: '70E8YqG5IUMJ9DNMHtEukbhfwJn2',
                    user_email: 'sophiad03@hotmail.com',
                    displayName: 'Sopa'
                };
            }
            else if (userTemp === '2')
            {
                userInfo = {
                    documentId: 'LbYvc1LonALQpleCAURt',
                    userId: 'OgGilSJwqCW3qMuHWlChEYka9js1',
                    user_email: 'test-user-1@tune-tracer.com',
                    displayName: 'test_one'  
                }

            }
            else
            {
                return;
            }
            const POST_OPTION = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userInfo),
            }
        fetch(SUBSCRIBE_TO_DOC_URL, POST_OPTION)
            .then((res) => {
                // Read result of the Cloud Function.
                res.json().then((data) => {
                    const compData : ScoreData = (data.data).score;
                    const document_title : string = (data.data).document_title;
                    const comments: Comment[] = (data.data).comments; 
                    const metadata: DocumentMetadata = (data.data).metadata; 
                    const tempDocument : Document = {
                        document_title: document_title,
                        comments: comments,
                        score: compData,
                        metadata: metadata
                    };
                    setDocument(tempDocument);
                    setScoreData(compData);
                    // console.log("Document:" + currentDocument);
                    setLoadState(true);
                    console.log("Document Loaded");
                });
            }).catch((error) => {
                // Getting the Error details.
                const message = error.message;
                console.log(`Error: ${message}`);
                return;
                // ...
              });
        }
    }, [userTemp]);

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
                    DEFAULT_RENDERER_WIDTH,
                    undefined
                );
            }
        };

        clearSVG();
        renderNotation();
    }, []);

    useEffect(() => {
        // Attach the note selection handler to the notationRef container
        d3.select(notationRef.current)
            .on('click', function(event) {
                // Grab a reference to what we click on
                let targetElement = event.target;

                // Keep going up the DOM to look for an element that has the VF note class
                while (targetElement && !targetElement.classList.contains('vf-stavenote')) {
                    targetElement = targetElement.parentElement;
                }

                // Check to see if we've found an element in the DOM with the class we're looking for
                if (targetElement && targetElement.classList.contains('vf-stavenote')) {
                    const selectId = d3.select(targetElement).attr('id');
                    setSelectedNoteId(parseInt(selectId));
                }
            });
        
        // Clean up the event listener when notationRef unmounts
        return () => {
            d3.select(notationRef.current).on('click', null);
        }
    }, [notationRef.current])

    useEffect(() => {
        // First remove the selectd note class from previously selected note
        d3.selectAll('.vf-stavenote').classed('selected-note', false);

        // Now add it to the currently selected note
        if (selectedNoteId !== -1)
        {
            d3.select(`[id="${selectedNoteId}"]`).classed('selected-note', true);
        }

        // Keyboard shortcuts for adding notes
        const handleKeyDown = (event: KeyboardEvent) => {
            // Mapping of keyboard letters to note string
            const keyToNoteMap: { [key: string]: string } = {
                'a': 'a/4',
                'b': 'b/4',
                'c': 'c/5',
                'd': 'd/5',
                'e': 'e/5',
                'f': 'f/5',
                'g': 'g/5',
            };

            const note = keyToNoteMap[event.key.toLowerCase()];

            // If a valid note was pressed and we have a note selected
            if (note && selectedNoteId !== -1) {
                addNoteHandler([note], selectedNoteId);
                const nextNote = score.current?.getAdjacentNote(selectedNoteId);
                if (nextNote)
                {
                    setSelectedNoteId(nextNote);
                }
            }
        };

        // Attach the keydown event listener
        const notationDiv = notationRef.current;
        if (notationDiv)
        {
            notationDiv.addEventListener('keydown', handleKeyDown);
            // Make the div focusable to capture keyboard input
            notationDiv.setAttribute('tabindex', '0');
        }

        // Clean up listener on ummount
        return () => {
            if (notationDiv)
            {
                notationDiv.removeEventListener('keydown', handleKeyDown);
            }
        }
    }, [selectedNoteId]);

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
                <ToolbarHeader
                    modifyDurationInMeasure={modifyDurationHandler}
                    selectedNoteId={selectedNoteId}
                />
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
                    <input 
                        type="text" 
                        value={currentDocument?.score?.title} 
                        onChange={handleScoreNameChange} 
                        placeholder={currentDocument?.score?.title} 
                    />
                    <input 
                        type="text" 
                        value={userTemp} 
                        onChange={handleUserIdChange} 
                        placeholder={userTemp} 
                    />
                    <div>
                        <div ref={notationRef}></div>
                    </div>
                </Container>
            </AppShell.Main>
        </AppShell>
    );
};
