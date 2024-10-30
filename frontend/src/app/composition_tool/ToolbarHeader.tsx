import { AppShell, Group, Tooltip, TextInput, Container, Center, ActionIcon, Space, Slider, rem, Select, Tabs, Button, Divider, Text } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { SharingModal } from "./Sharing";
import {
    IconPlayerPlay,
    IconPlayerPause,
    IconPlayerStop,
    IconVolume,
} from "@tabler/icons-react";
import { getUserID, getDisplayName, getEmail, getDocumentID } from "../cookie";


export const ToolbarHeader: React.FC<{
    documentName: string,
    modifyDurationInMeasure: (duration: string, noteId: number) => void;
    selectedNoteId: number;
    playbackComposition: () => void;
    stopPlayback: () => void;
    volume: number;
    onVolumeChange: (value: number) => void;
    addMeasure: () => void;
}> = ({ documentName, modifyDurationInMeasure, selectedNoteId, playbackComposition, stopPlayback, volume, onVolumeChange, addMeasure }) => {
    // State to manage the input value
    const [inputValue, setInputValue] = useState("Untitled Score");

    // State to toggle between edit and display modes
    const [isChangingName, setIsChangingName] = useState(false);

    // Handle the save action (when pressing Enter or clicking outside)
    const handleSave = () => {
        setIsChangingName(false); // Exit edit mode and save
    };

    useEffect(() => {
        setInputValue(documentName);
    }, [documentName]);

    const handleDocumentNameChange = (event: { currentTarget: { value: any; }; }) => {
        setInputValue(event.currentTarget.value);
        const UPDATE_DOCUMENT_NAME_URL = 'https://us-central1-l17-tune-tracer.cloudfunctions.net/updatePartialDocument';

        const new_title = {
            documentId: getDocumentID(),
            documentChanges: {document_title: event.currentTarget.value},
            writerId: getUserID()
        };
        const PUT_OPTION = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(new_title)
        }
        fetch(UPDATE_DOCUMENT_NAME_URL, PUT_OPTION);
    };
    // Handle when the user clicks the text to switch to editing mode
    const handleEdit = () => {
        setIsChangingName(true);
    };

    // Toggle between editable and read-only states
    const [mode, setMode] = useState<string>("Editable");
    const handleModeChange = (value: any) => {
        setMode(value);
    }

    return (
        <AppShell.Header p="md">
            {/* First layer (top section) PUT IF STATEMENT HERE IF READ ONLY*/}
            <Group
                align="center"
                style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}
            >
                <Tooltip label="Back to Home">
                    <Text size="xl" component="a" href="/storage">
                        Tune Tracer
                    </Text>
                </Tooltip>

                {/* Editable Document Title */}
                {isChangingName ? (
                    <TextInput
                        size="md"
                        value={inputValue}
                        onChange={handleDocumentNameChange} // Update input value
                        onBlur={handleSave} // Save on focus loss
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                handleSave(); // Save on Enter key press
                            }
                        }}
                        placeholder="Enter Document Name"
                        autoFocus // Auto-focus when entering edit mode
                    />
                ) : (
                    <Text
                        onClick={handleEdit}
                        style={{
                            cursor: "text",
                            padding: "3px",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.outline =
                                "2px solid rgba(128, 128, 128, 0.6)"; // Slightly dimmed gray outline
                            e.currentTarget.style.outlineOffset = "3px"; // Space between outline and text
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.outline = "none"; // Remove outline on mouse leave
                        }}
                    >
                        {inputValue || "Untitled Score"}
                    </Text>
                )}

                {/* PlayBack UI */}
                <Container fluid style={{ width: "20%" }}>
                    <Center>
                        <Group>
                            <ActionIcon onClick={() => playbackComposition()}>
                                <IconPlayerPlay />
                            </ActionIcon>
                            <ActionIcon>
                                <IconPlayerPause />
                            </ActionIcon>
                            <ActionIcon onClick={() => stopPlayback()}>
                                <IconPlayerStop />
                            </ActionIcon>
                        </Group>
                    </Center>
                    <Space h="xs"></Space>
                    <Slider
                        value={volume}
                        onChange={onVolumeChange}
                        thumbChildren={<IconVolume />}
                        label={(value) => `${value}%`}
                        defaultValue={50}
                        thumbSize={26}
                        styles={{ thumb: { borderWidth: rem(2), padding: rem(3) } }}
                    />
                </Container>

                {/* Sharing UI */}

                {/* Select Dropdown should not be changable if not the owner */}
                <Select
                    placeholder="Select Sharing Mode"
                    onChange={(value) => handleModeChange(value)}
                    allowDeselect={false}
                    withCheckIcon={false}
                    style={{ width: 125, marginLeft: '10px' }}
                />
                <SharingModal />
            </Group>

            {/* Second layer (middle section) */}
            {/* <Group align="center" mt="xs" style={{ paddingBottom: "10px" }}> */}
            <Tabs defaultValue="notes">
                <Tabs.List>
                    <Tabs.Tab value="notes">Notes</Tabs.Tab>
                    <Tabs.Tab value="measure">Measure</Tabs.Tab>
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
                        <Button
                            variant="outline"
                            onClick={() => modifyDurationInMeasure('h', selectedNoteId)}
                        >
                            Half
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => modifyDurationInMeasure('q', selectedNoteId)}
                        >
                            Quarter
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => modifyDurationInMeasure('8', selectedNoteId)}
                        >
                            Eighth
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => modifyDurationInMeasure('16', selectedNoteId)}
                        >
                            Sixteenth
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => modifyDurationInMeasure('32', selectedNoteId)}
                        >
                            Thirty-Second
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => modifyDurationInMeasure('64', selectedNoteId)}
                        >
                            Sixty-Fourth
                        </Button>

                        <Divider size="sm" orientation="vertical" />

                        <Button variant="outline">Dot</Button>

                        <Divider size="sm" orientation="vertical" />

                        <Button>Help</Button>
                    </Group>
                </Tabs.Panel>

                <Tabs.Panel value="measure">
                    <Space h="xs"></Space>
                    <Group>
                        <Button
                            variant="outline"
                            onClick={addMeasure}
                        >
                            Add Measure
                        </Button>
                        <Button variant="outline">Delete Measure</Button>
                    </Group>
                </Tabs.Panel>

                <></>
            </Tabs>
            {/* </Group> */}
        </AppShell.Header>
    );
};