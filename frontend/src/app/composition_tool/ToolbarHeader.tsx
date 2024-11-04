import {
  AppShell,
  Group,
  Tooltip,
  TextInput,
  Container,
  Center,
  ActionIcon,
  Space,
  Slider,
  rem,
  Select,
  Tabs,
  Button,
  Divider,
  Text,
  Image,
} from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";
import { SharingModal } from "./sharing/SharingModal";
import { KeybindModal } from "./KeybindModal";
import {
    IconPlayerPlay,
    IconPlayerStop,
    IconVolume,
} from "@tabler/icons-react";
import { getUserID } from "../cookie";
import Link from 'next/link';
import { callAPI } from "../../utils/callAPI";
import { useSearchParams } from "next/navigation";
import { STATUS, ACTIONS} from "react-joyride"

import { DocumentMetadata } from "../lib/src/documentProperties";
import { ShareStyle } from "../lib/src/documentProperties";
import EditorTutorial from "./editor-tutorial";

const keySignatures = [
{ label: "C Major", value: "C" },
{ label: "G Major", value: "G" },
{ label: "D Major", value: "D" },
{ label: "A Major", value: "A" },
{ label: "E Major", value: "E" },
{ label: "B Major", value: "B" },
{ label: "F# Major", value: "F#" },
{ label: "C# Major", value: "C#" },
{ label: "A Minor", value: "Am" },
{ label: "E Minor", value: "Em" },
{ label: "B Minor", value: "Bm" },
{ label: "F# Minor", value: "F#m" },
{ label: "C# Minor", value: "C#m" },
{ label: "G# Minor", value: "G#m" },
{ label: "D# Minor", value: "D#m" },
{ label: "A# Minor", value: "A#m" },
{ label: "F Major", value: "F" },
{ label: "B♭ Major", value: "Bb" },
{ label: "E♭ Major", value: "Eb" },
{ label: "A♭ Major", value: "Ab" },
{ label: "D♭ Major", value: "Db" },
{ label: "G♭ Major", value: "Gb" },
{ label: "C♭ Major", value: "Cb" },
{ label: "D Minor", value: "Dm" },
{ label: "G Minor", value: "Gm" },
{ label: "C Minor", value: "Cm" },
{ label: "F Minor", value: "Fm" },
{ label: "B♭ Minor", value: "Bbm" },
{ label: "E♭ Minor", value: "Ebm" },
{ label: "A♭ Minor", value: "Abm" },
];

export const ToolbarHeader: React.FC<{
    documentName: string;
    documentMetadata: DocumentMetadata;
    modifyDurationInMeasure: (duration: string, noteId: number) => void;
    selectedNoteId: number;
    playbackComposition: () => void;
    stopPlayback: () => void;
    volume: number;
    onVolumeChange: (value: number) => void;
    addMeasure: () => void;
    removeMeasure: () => void;
    addTie: (noteId: number) => void;
    removeTie: (noteId: number) => void;
    addSharp: (keys: string[], noteId: number) => void;
    addNatural: (keys: string[], noteId: number) => void;
    addFlat: (keys: string[], noteId: number) => void;
    removeAccidentals: (keys: string[], noteID: number) => void;
    handleDot: (dotType: number, noteId: number) => void;
    setKeySignature: (keySignature: string) => void;
    hasWriteAccess: boolean;
    selectedKey: string;
}> = ({
    documentName,
    documentMetadata,
    modifyDurationInMeasure,
    selectedNoteId,
    playbackComposition,
    stopPlayback,
    volume,
    onVolumeChange,
    addMeasure,
    removeMeasure,
    addTie,
    removeTie,
    addSharp,
    addNatural,
    addFlat,
    removeAccidentals,
    handleDot,
    setKeySignature,
    hasWriteAccess,
    selectedKey
}) => {
      // State to manage the input value
      const [inputValue, setInputValue] = useState("Untitled Score");
      const [shareStyle, setShareStyle] = useState(ShareStyle.NONE);
      const searchParams = useSearchParams();

      // State to toggle between edit and display modes
      const [isChangingName, setIsChangingName] = useState(false);
      const documentID = useRef<string>();

      // Handle the save action (when pressing Enter or clicking outside)
      const handleSave = () => {
          const new_title = {
            documentId: documentID.current,
            documentChanges: {  document_title: inputValue  },
            writerId: getUserID(),
          };
          callAPI("updatePartialDocument", new_title);
          setIsChangingName(false); // Exit edit mode and save
      };

useEffect(() => {
  setInputValue(documentName);
  documentID.current = searchParams.get("id") || "null";
}, [documentName]);

      useEffect(() => {
          setShareStyle(documentMetadata?.share_link_style ?? ShareStyle.NONE);
      }, [documentMetadata]);

      const handleDocumentNameChange = (event: {
          currentTarget: { value: any };
      }) => {
        setInputValue(event.currentTarget.value);
      };

      const handleTitleSave = () => {
        const new_title = {
          documentId: documentID.current,
          documentChanges: {  document_title: inputValue  },
          writerId: getUserID(),
        };
        callAPI("updatePartialDocument", new_title);
      };
    // Handle when the user clicks the text to switch to editing mode
    const handleEdit = () => {
          if(!hasWriteAccess) return;
      setIsChangingName(true);
    };

      // Toggle between editable and read-only states
      const [mode, setMode] = useState<string>("Editable");
      const handleModeChange = (value: any) => {
          setMode(value);
      };
      const [run, setRun] = useState(false);
        // const [stepIndex, setStepIndex] = useState(0);
        const [actions, setActions] = useState(ACTIONS);
        const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []); 

  // Something is wrong with the callback, not allowing to move forward in states
  // Handle tutorial callback to manage step progression and tutorial completion
  const handleJoyrideCallback = (data: any) => {
    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    console.log('data', data);

    if (finishedStatuses.includes(status)) {
      setRun(false);
    }
  };


        return (
            <AppShell.Header p="md">
                {isClient && (
                  <EditorTutorial
                  run={run}
                  onCallback={handleJoyrideCallback}
                />)}
            <Group
                    align="center"
                    style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}
                >
                    {/* Need to route back to storage page */}
                    <Tooltip label="Back to Home">
                        <Link href="/storage">
                            <Image
                                // component="a"
                                // href="/storage"
                                h={50}
                                w="auto"
                                fit="contain"
                                src="TuneTracerLogo.png"
                            />
                        </Link>
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
                            className="editable-title"
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
                    <Container fluid style={{ width: "20%" }} className="playback">
                        <Center>
                            <Group>
                                <ActionIcon onClick={() => playbackComposition()}>
                                    <IconPlayerPlay />
                                </ActionIcon>
                                {/* <ActionIcon>
                                    <IconPlayerPause />
                                </ActionIcon> */}
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
                    {hasWriteAccess && <SharingModal
                      documentTitle={inputValue}
                      metadata={documentMetadata}
                    />}
            </Group>

                {/* Second layer (middle section) */}
                <Group className="tabs" align="space-between" mt="xs" style={{ paddingBottom: "10px" }}>
                {hasWriteAccess && <Tabs defaultValue="notes">
                    <Tabs.List>
                        <Tabs.Tab value="notes">Notes</Tabs.Tab>
                        <Tabs.Tab value="measure">Measure</Tabs.Tab>
                    </Tabs.List>

        {/* Notes Tab */}
        <Tabs.Panel value="notes">
          <Space h="xs" />
          <Group className="toolbar">
            {/* Accidentals */}
            <Tooltip label="Add Natural" position="top" withArrow>
              <Button
                size="compact-md"
                variant="outline"
                onClick={() => addNatural([selectedKey], selectedNoteId)}
              >
                <Image h={20} w="auto" fit="contain" src="/icons/natural.jpg" />
              </Button>
            </Tooltip>
            <Tooltip label="Add Sharp" position="top" withArrow>
              <Button
                size="compact-md"
                variant="outline"
                onClick={() => addSharp([selectedKey], selectedNoteId)}
              >
                <Image h={20} w="auto" fit="contain" src="/icons/Sharp.png" />
              </Button>
            </Tooltip>
            <Tooltip label="Add Flat" position="top" withArrow>
              <Button
                size="compact-md"
                variant="outline"
                onClick={() => addFlat([selectedKey], selectedNoteId)}
              >
                <Image h={20} w="auto" fit="contain" src="/icons/flat.jpg" />
              </Button>
            </Tooltip>
            <Tooltip label="Remove Accidental" position="top" withArrow>
              <Button
                size="compact-md"
                variant="outline"
                onClick={() => removeAccidentals([selectedKey], selectedNoteId)}
              >
                <Image h={20} w="auto" fit="contain" src="/icons/removeAccidentals.png" />
              </Button>
            </Tooltip>

                            <Divider size="sm" orientation="vertical" />

            {/* Note/Rest Duration */}
            <Tooltip label="Whole Note Duration" position="top" withArrow>
              <Button
                size="compact-md"
                variant="outline"
                onClick={() => modifyDurationInMeasure("w", selectedNoteId)}
              >
                <Image h={10} w={20} fit="contain" src="/icons/wholeNote.jpg" />
              </Button>
            </Tooltip>
            <Tooltip label="Half Note Duration" position="top" withArrow>
              <Button
                size="compact-md"
                variant="outline"
                onClick={() => modifyDurationInMeasure("h", selectedNoteId)}
              >
                <Image
                  h={20}
                  w="auto"
                  fit="contain"
                  src="/icons/halfNote.jpg"
                />
              </Button>
            </Tooltip>
            <Tooltip label="Quarter Note Duration" position="top" withArrow>
              <Button
                size="compact-md"
                variant="outline"
                onClick={() => modifyDurationInMeasure("q", selectedNoteId)}
              >
                <Image
                  h={20}
                  w="auto"
                  fit="contain"
                  src="/icons/quarterNote.png"
                />
              </Button>
            </Tooltip>
            <Tooltip label="Eighth Note Duration" position="top" withArrow>
              <Button
                size="compact-md"
                variant="outline"
                onClick={() => modifyDurationInMeasure("8", selectedNoteId)}
              >
                <Image h={20} w="auto" fit="contain" src="/icons/8thNote.jpg" />
              </Button>
            </Tooltip>
            <Tooltip label="Sixteenth Note Duration" position="top" withArrow>
              <Button
                size="compact-md"
                variant="outline"
                onClick={() => modifyDurationInMeasure("16", selectedNoteId)}
              >
                <Image
                  h={20}
                  w="auto"
                  fit="contain"
                  src="/icons/16thNote.jpg"
                />
              </Button>
            </Tooltip>
            <Tooltip
              label="Thirty-Second Note Duration"
              position="top"
              withArrow
            >
              <Button
                size="compact-md"
                variant="outline"
                onClick={() => modifyDurationInMeasure("32", selectedNoteId)}
              >
                <Image
                  h={20}
                  w="auto"
                  fit="contain"
                  src="/icons/32ndNote.jpg"
                />
              </Button>
            </Tooltip>
            <Tooltip
              label="Sixty-Fourth Note Duration"
              position="top"
              withArrow
            >
              <Button
                size="compact-md"
                variant="outline"
                onClick={() => modifyDurationInMeasure("64", selectedNoteId)}
              >
                <Image
                  h={20}
                  w="auto"
                  fit="contain"
                  src="/icons/64thNote.png"
                />
              </Button>
            </Tooltip>

            <Divider size="sm" orientation="vertical" />

            {/* Dots */}
            <Tooltip label="Add Single Dot" position="top" withArrow>
              <Button
                size="compact-md"
                variant="outline"
                onClick={() => handleDot(1, selectedNoteId)}
              >
                <Image
                  h={10}
                  w="auto"
                  fit="contain"
                  src="/icons/Dotted_whole_note.jpg"
                />
              </Button>
            </Tooltip>

            <Tooltip label="Add Double Dot" position="top" withArrow>
              <Button
                size="compact-md"
                variant="outline"
                onClick={() => handleDot(2, selectedNoteId)}
              >
                <Image
                  h={10}
                  w="auto"
                  fit="contain"
                  src="/icons/Double_dotted_whole_note.jpg"
                />
              </Button>
            </Tooltip>

                            <Divider size="sm" orientation="vertical" />

            {/* Ties */}
            <Tooltip label="Add Tie" position="top" withArrow>
              <Button variant="outline" onClick={() => addTie(selectedNoteId)}>
              <Image
                  h={25}
                  w="auto"
                  fit="contain"
                  src="/icons/tie.png"
                />
              </Button>
            </Tooltip>
            <Tooltip label="Remove Tie" position="top" withArrow>
              <Button
                variant="outline"
                onClick={() => removeTie(selectedNoteId)}
              >
                <Image
                  h={25}
                  w="auto"
                  fit="contain"
                  src="/icons/noTie.png"
                />
              </Button>
            </Tooltip>
          </Group>
        </Tabs.Panel>

        <Tabs.Panel value="measure">
          <Space h="xs" />
          <Group>
            {/* Measures */}
            <Tooltip label="Add Measure" position="top" withArrow>
              <Button variant="outline" onClick={addMeasure}>
                Add Measure
              </Button>
            </Tooltip>
            <Tooltip label="Delete Measure" position="top" withArrow>
              <Button variant="outline" onClick={removeMeasure}>
                Delete Measure
              </Button>
            </Tooltip>

                            <Divider size="sm" orientation="vertical" />

            {/* Signatures */}
            <Text>Set Key Signature: </Text>
            <Tooltip label="Choose Key Signature" position="top" withArrow>
              <Select
                placeholder="Choose Key Signature"
                onChange={(value) => value && setKeySignature(value)}
                data={keySignatures}
              />
            </Tooltip>
          </Group>
        </Tabs.Panel>

                    <></>
                </Tabs>}
                {!hasWriteAccess && <Center style={{ width: '100%', paddingTop: '30px'}}>
                    <Text fw={700} c = "blue" size="lg">
                        YOU ONLY HAVE READ ACCESS TO THIS SCORE
                    </Text>
                </Center>}
          
                  

                {hasWriteAccess && (
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "45px", width: " 16%", marginLeft: "auto", flexWrap: "nowrap"}}>
                    <KeybindModal />
                    <Tooltip label="Help" position="top" withArrow>
                      <Button className="tutorial-button" onClick={() => setRun(true)}>Help</Button>
                    </Tooltip>
                  </div>
                )}
      </Group>
            </AppShell.Header>
        );
    };