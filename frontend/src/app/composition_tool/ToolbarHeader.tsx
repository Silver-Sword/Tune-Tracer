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
import React, { useEffect, useState } from "react";
import { SharingModal } from "./Sharing";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerStop,
  IconVolume,
} from "@tabler/icons-react";
import { getUserID, getDisplayName, getEmail, getDocumentID } from "../cookie";

const keySignatures = [
  { label: 'C Major', value: 'C' },
  { label: 'G Major', value: 'G' },
  { label: 'D Major', value: 'D' },
  { label: 'A Major', value: 'A' },
  { label: 'E Major', value: 'E' },
  { label: 'B Major', value: 'B' },
  { label: 'F# Major', value: 'F#' },
  { label: 'C# Major', value: 'C#' },
  { label: 'A Minor', value: 'Am' },
  { label: 'E Minor', value: 'Em' },
  { label: 'B Minor', value: 'Bm' },
  { label: 'F# Minor', value: 'F#m' },
  { label: 'C# Minor', value: 'C#m' },
  { label: 'G# Minor', value: 'G#m' },
  { label: 'D# Minor', value: 'D#m' },
  { label: 'A# Minor', value: 'A#m' },
  { label: 'F Major', value: 'F' },
  { label: 'B♭ Major', value: 'Bb' },
  { label: 'E♭ Major', value: 'Eb' },
  { label: 'A♭ Major', value: 'Ab' },
  { label: 'D♭ Major', value: 'Db' },
  { label: 'G♭ Major', value: 'Gb' },
  { label: 'C♭ Major', value: 'Cb' },
  { label: 'D Minor', value: 'Dm' },
  { label: 'G Minor', value: 'Gm' },
  { label: 'C Minor', value: 'Cm' },
  { label: 'F Minor', value: 'Fm' },
  { label: 'B♭ Minor', value: 'Bbm' },
  { label: 'E♭ Minor', value: 'Ebm' },
  { label: 'A♭ Minor', value: 'Abm' },
];

export const ToolbarHeader: React.FC<{
  documentName: string;
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
	handleDot: (dotType: number, noteId: number) => void;
  // removeAccidentals: (keys: string, noteID: string) => void;
  setKeySignature: (keySignature: string) => void;
}> = ({
  documentName,
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
	handleDot,
	// removeAccidentals,
	setKeySignature,
}) => {
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

  const handleDocumentNameChange = (event: {
    currentTarget: { value: any };
  }) => {
    setInputValue(event.currentTarget.value);
    const UPDATE_DOCUMENT_NAME_URL =
      "https://us-central1-l17-tune-tracer.cloudfunctions.net/updatePartialDocument";

    const new_title = {
      documentId: getDocumentID(),
      documentChanges: { document_title: event.currentTarget.value },
      writerId: getUserID(),
    };
    const PUT_OPTION = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(new_title),
    };
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
  };

  return (
    <AppShell.Header p="md">
      {/* First layer (top section) PUT IF STATEMENT HERE IF READ ONLY*/}
      <Group
        align="center"
        style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}
      >
        {/* Need to route back to storage page */}
        <Tooltip label="Back to Home">
          <Image
            // component="a"
            // href="/storage"
            h={50}
            w="auto"
            fit="contain"
            src="TuneTracerLogo.png"
          />
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
          style={{ width: 125, marginLeft: "10px" }}
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
            {/* Accidentals */}
            <Button 
							size="compact-md" 
							variant="outline"
							onClick={() => addNatural(["a/4"], selectedNoteId)}
            >
              <Image h={20} w="auto" fit="contain" src="/icons/natural.jpg" />
            </Button>
            <Button 
							size="compact-md"
							variant="outline"
							onClick={() => addSharp(["a/4"], selectedNoteId)}	
						>
              <Image h={20} w="auto" fit="contain" src="/icons/Sharp.png" />
            </Button>
            <Button
							size="compact-md"
							variant="outline"
							onClick={() => addFlat(["a/4"], selectedNoteId)}
						>
              <Image h={20} w="auto" fit="contain" src="/icons/flat.jpg" />
            </Button>

            <Divider size="sm" orientation="vertical" />

            {/* Note/Rest Duration */}
            <Button
              size="compact-md"
              variant="outline"
              onClick={() => modifyDurationInMeasure("w", selectedNoteId)}
            >
              <Image h={10} w={20} fit="contain" src="/icons/wholeNote.jpg" />
            </Button>
            <Button
              size="compact-md"
              variant="outline"
              onClick={() => modifyDurationInMeasure("h", selectedNoteId)}
            >
              <Image h={20} w="auto" fit="contain" src="/icons/halfNote.jpg" />
            </Button>
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
            <Button
              size="compact-md"
              variant="outline"
              onClick={() => modifyDurationInMeasure("8", selectedNoteId)}
            >
              <Image h={20} w="auto" fit="contain" src="/icons/8thNote.jpg" />
            </Button>
            <Button
              size="compact-md"
              variant="outline"
              onClick={() => modifyDurationInMeasure("16", selectedNoteId)}
            >
              <Image h={20} w="auto" fit="contain" src="/icons/16thNote.jpg" />
            </Button>
            <Button
              size="compact-md"
              variant="outline"
              onClick={() => modifyDurationInMeasure("32", selectedNoteId)}
            >
              <Image h={20} w="auto" fit="contain" src="/icons/32ndNote.jpg" />
            </Button>
            <Button
              size="compact-md"
              variant="outline"
              onClick={() => modifyDurationInMeasure("64", selectedNoteId)}
            >
              <Image h={20} w="auto" fit="contain" src="/icons/64thNote.png" />
            </Button>

            <Divider size="sm" orientation="vertical" />
            
            {/* Dots */}
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

            <Divider size="sm" orientation="vertical" />

            {/* Ties */}
            <Button variant="outline" onClick={() => addTie(selectedNoteId)}>
              Add Tie
            </Button>
            <Button variant="outline" onClick={() => removeTie(selectedNoteId)}>
              Remove Tie
            </Button>
            <Divider size="sm" orientation="vertical" />

            <Button>Help</Button>
          </Group>
        </Tabs.Panel>

        <Tabs.Panel value="measure">
          <Space h="xs"></Space>
          <Group>
            {/* Measures */}
            <Button variant="outline" onClick={addMeasure}>
              Add Measure
            </Button>
            <Button variant="outline" onClick={removeMeasure}>
              Delete Measure
            </Button>

            <Divider size="sm" orientation="vertical" />

            {/* Signatures */}              
              <Select
                placeholder="Set Key Signature"
                onChange={(value) => value && setKeySignature(value)}
                data={keySignatures}
              />
          </Group>
        </Tabs.Panel>

        <></>
      </Tabs>
      {/* </Group> */}
    </AppShell.Header>
  );
};
