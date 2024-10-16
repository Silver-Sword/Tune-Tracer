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
} from "@mantine/core";
import * as d3 from 'd3';


const ToolbarHeader: React.FC<{
    modifyDurationInMeasure: (duration: string, noteId: number) => void;
    selectedNoteId: number;
}> = ({ modifyDurationInMeasure, selectedNoteId }) => {
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
                <Button>Share</Button>
            
        </Group>
  
        {/* Second layer (middle section) */}
        <Group align="center" mt="md" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
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

            </Group>
            <Input placeholder="Search..." />
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
    
    return (
        <AppShell.Aside withBorder p="md">
            <Stack gap="xs">
                <CommentCard />
                <CommentCard />
                <CommentCard />
            </Stack>
        </AppShell.Aside>
    );
};

const DEFAULT_RENDERER_WIDTH = 1000;
const DEFAULT_RENDERER_HEIGHT = 2000;

export default function CompositionTool() {
    const notationRef = useRef<HTMLDivElement>(null);
    const score = useRef<Score | null>(null);
    const [selectedNoteId, setSelectedNoteId] = useState<number>(-1);
    
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
            
            header={{ height: 150 }}
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
                    <Text>Score Name</Text>

                    <div>
                        <div ref={notationRef}></div>
                    </div>
                </Container>
            </AppShell.Main>
        </AppShell>
    );
};
