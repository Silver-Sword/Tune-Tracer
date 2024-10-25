"use client"; // IMPORTANT as Vexflow only renders in the DOM

import React, { useEffect, useRef, useState } from "react";
import { Score } from "../edit/Score";
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
  CopyButton,
  Select,
} from "@mantine/core";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerStop,
  IconVolume,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";


// Define types for the collaborator
interface Collaborator {
  name: string;
  email: string;
  role: 'Viewer' | 'Commenter' | 'Editor';
}

// CollaboratorCard component used in SharingModal to show who has access 
const CollaboratorCard: React.FC<{
  name: string;
  email: string;
  role: 'Viewer' | 'Commenter' | 'Editor';
  onRoleChange: (newRole: 'Viewer' | 'Commenter' | 'Editor') => void;
  onRemove: () => void;
}> = ({ name, email, role, onRoleChange, onRemove }) => {
  const [currentRole, setCurrentRole] = useState<'Viewer' | 'Commenter' | 'Editor' | 'Remove access'>(role);

  const handleRoleChange = (newRole: 'Viewer' | 'Commenter' | 'Editor' | 'Remove access') => {
    if (newRole === 'Remove access') {
      onRemove(); // Call the remove function if "Remove access" is selected
    } else {
      setCurrentRole(newRole);
      onRoleChange(newRole);
    }
  };

  return (
    <Group
      justify="space-between"
      style={{
        padding: '15px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        marginBottom: '10px',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Avatar and Collaborator Info */}
      <Group>
        <div>
          <Text size="sm">{name}</Text>
          <Text size="xs" c="dimmed">{email}</Text>
        </div>
      </Group>

      {/* Role Selector */}
      <Select
        checkIconPosition="right"
        value={currentRole}
        onChange={(newRole) => handleRoleChange(newRole as 'Viewer' | 'Commenter' | 'Editor' | 'Remove access')}
        data={[
          { value: 'Viewer', label: 'Viewer' },
          { value: 'Commenter', label: 'Commenter' },
          { value: 'Editor', label: 'Editor' },
          { value: 'Remove access', label: 'Remove access' }  // Red to differentiate remove
        ]}
        style={{ width: 150 }}
      />
    </Group>
  );
};

// Sharing Modal Component
const SharingModal: React.FC = () => {
  // Sharing logic here
  const [openShare, { open, close }] = useDisclosure(false);

  // SAMPLE
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { name: 'Jose Cuyugan', email: 'werhhh@gmail.com', role: 'Editor' },
    { name: 'Chris Gittings', email: 'asdfadf.cg@gmail.com', role: 'Viewer' },
    { name: 'Jordy Valois', email: 'dddddd@gmail.com', role: 'Commenter' },
    { name: 'Sophia DeAngelo', email: 'ssss@hotmail.com', role: 'Editor' },
  ]);
  
  const handleRoleChange = (newRole: 'Viewer' | 'Commenter' | 'Editor', index: number) => {
    const updatedCollaborators = [...collaborators];
    updatedCollaborators[index].role = newRole;
    setCollaborators(updatedCollaborators);
  };

  // Function to remove a collaborator
  const handleRemove = (index: number) => {
    const updatedCollaborators = collaborators.filter((_, i) => i !== index);
    setCollaborators(updatedCollaborators);
  };

  return (
    <>
      <Modal
        opened={openShare}
        onClose={close}
        title="Share: [Document Name]"
        centered
        size="lg"
      >
        {/* Modal content */}
        <TextInput placeholder="Add collaborators by email here"></TextInput>
        <Space h="sm" />
        <Text>Collaborators</Text>
        <ScrollArea h={250}>
          {collaborators.map((collab, index) => (
            <CollaboratorCard
              key={index}
              name={collab.name}
              email={collab.email}
              role={collab.role}
              onRoleChange={(newRole) => handleRoleChange(newRole, index)}
              onRemove={() => handleRemove(index)}
            />
          ))}
        </ScrollArea>
          
        <Divider size="sm" my="sm"></Divider>

        <Text>Code Access</Text>
        <Space h="sm"></Space>
        <Group justify="space-between">
          <Container>
          {/* Code gets rendered here, it is limited to 6 numbers */}
            <Text ta="center" c="blue" fw={700} style={{ letterSpacing: '0.5em'}}>
              651172
            </Text>
          </Container>

          <Group>
          {/* Uncomment block if multiple codes are allowed to exist based on access level */}
          <Select
            checkIconPosition="right"
            value={null}
            placeholder="Access Level"
            data={[
              { value: 'Viewer', label: 'Viewer' },
              { value: 'Commenter', label: 'Commenter' },
              { value: 'Editor', label: 'Editor' },
            ]}
            style={{ width: 150 }}
          />

          <Button>Generate Code</Button>
          </Group>
        </Group>
          
        <Divider size="sm" my="sm"></Divider>
          
        <Text>Link Access</Text>
        <Space h="sm"></Space>    
          {/* Replace value with the document link */}
          <Center>
          <CopyButton value="null" timeout={10000}>
            {({ copied, copy }) => (
              <Button
                rightSection={copied ? <IconCheck /> : <IconCopy />}
                variant={copied ? "filled" : "outline"}
                onClick={copy}
              >
                {copied ? "Copied" : "Copy Link"}
              </Button>
            )}
          </CopyButton>
          </Center>
      </Modal>
      <Button onClick={open}>Share</Button>
      {/* Profile Icon */}
    </>
  );
};
import * as d3 from 'd3';
import * as Tone from 'tone';



const ToolbarHeader: React.FC<{
    modifyDurationInMeasure: (duration: string, noteId: number) => void;
    selectedNoteId: number;
    playbackComposition: () => void;
    stopPlayback: () => void;
}> = ({ modifyDurationInMeasure, selectedNoteId, playbackComposition, stopPlayback }) => {
  // State to manage the input value
  const [inputValue, setInputValue] = useState("Untitled Score");

  // State to toggle between edit and display modes
  const [isChangingName, setIsChangingName] = useState(false);

  // Handle the save action (when pressing Enter or clicking outside)
  const handleSave = () => {
    setIsChangingName(false); // Exit edit mode and save
  };

  // Handle when the user clicks the text to switch to editing mode
  const handleEdit = () => {
    setIsChangingName(true);
  };

  // Toggle between editable and read-only states
  const [ mode, setMode ] = useState("Editable");
  const handleModeChange = (value) => {
    setMode(value);
  }

  // Need logic for swapping pause and play buttons, also if hitting stop it completely resets the time back to 0

  const [volume, setVolume] = useState(50);

  const handleVolumeChange = (value: React.SetStateAction<number>) => {
    setVolume(value);
    console.log(`Volume value is: ${value}`);
    // if (audioRef.current) {
    //   audioRef.current.volume = value / 100; // Convert to a scale of 0 to 1 for audio API
    // }
  };

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
            onChange={(event) => setInputValue(event.currentTarget.value)} // Update input value
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
            onChange={handleVolumeChange}
            thumbChildren={<IconVolume />}
            label={(value) => `${value}%`}
            defaultValue={50}
            thumbSize={26}
            styles={{ thumb: { borderWidth: rem(2), padding: rem(3) } }}
          />
        </Container>

        {/* I'd like to have everything left justified except the sharing button */}
        {/* Sharing UI */}

        {/* Select Dropdown should not be changable if not the owner */}
        <Select
          data={['Editable', 'Read-Only']}
          value={mode}
          onChange={handleModeChange}
          placeholder="Select Sharing Mode"
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
                <Button variant="outline">Sixty-Fourth</Button>

              <Divider size="sm" orientation="vertical" />

              <Button variant="outline">Dot</Button>

              <Divider size="sm" orientation="vertical" />

              <Button>Help</Button>
            </Group>
          </Tabs.Panel>

          <Tabs.Panel value="measure">
            <Space h="xs"></Space>
            <Group>
              <Button variant="outline">Add Measure</Button>
              <Button variant="outline">Delete Measure</Button>
            </Group>
          </Tabs.Panel>

          <></>
        </Tabs>
      {/* </Group> */}
    </AppShell.Header>
  );
};

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

const DEFAULT_RENDERER_WIDTH = 1000;
const DEFAULT_RENDERER_HEIGHT = 2000;

export default function CompositionTool() {
    const notationRef = useRef<HTMLDivElement>(null);
    const score = useRef<Score | null>(null);
    const [selectedNoteId, setSelectedNoteId] = useState<number>(-1);
    let topPart: Tone.Part;
    let bottomPart: Tone.Part;
    
    // Wrapper function to call modifyDurationInMeasure with the score object
    const modifyDurationHandler = (duration: string, noteId: number) => {
        if (score && score.current)
        {
            score.current.modifyDurationInMeasure(duration, noteId);
        }
    }

    const playbackAwaiter = async () => {
        await Tone.start();
        console.log('Context started');
        playbackComposition();
    }

    const stopPlayback = () => {
        // Kill any audio that is currently playing
        Tone.getTransport().stop();
        // Reset the position to the start
        Tone.getTransport().position = 0;
    }

    // Function to play composition
    const playbackComposition = () => {
        stopPlayback();

        const synth = new Tone.PolySynth().toDestination();

        if (topPart)
        {
            topPart.dispose();
        }
        if (bottomPart)
        {
            bottomPart.dispose();
        }

        if (score && score.current)
        {
            const scoreData = score.current.exportScoreDataObj();
            const topMeasureData = scoreData.topMeasures;
            const bottomMeasureData = scoreData.bottomMeasures;
            const topMeasures = score.current.getTopMeasures();
            const bottomMeasures = score.current.getBottomMeasures();

            // Map for durations since ToneJS and VexFlow use different
            // representation strings for duration
            const durationMap: { [duration: string]: string } = {
                'q': '4n',
                'w': '1n',
                'h': '2n',
                '8': '8n',
                '16': '16n',
                '32': '32n',
                'qr': '4n',
                'wr': '1n',
                'hr': '2n',
                '8r': '8n',
                '16r': '16n',
                '32r': '32n'
            };

            // Create two separate parts. One for treble clef, one for bass clef
            topPart = new Tone.Part();
            bottomPart = new Tone.Part();

            // Keep track of the current time for each measure separately
            let currentTimeTop = 0;
            let currentTimeBottom = 0;

            // Iterate over each measure
            for (let i = 0; i < topMeasureData.length; i++)
            {
                const topNotes = topMeasureData[i].notes;
                const bottomNotes = bottomMeasureData[i].notes;
                const topStaveNotes = topMeasures[i].getNotes();
                const bottomStaveNotes = bottomMeasures[i].getNotes();
                

                // 1. Remove the '/' from the note string
                // 2. Map the duration to a string that ToneJs likes (q -> 4n, w -> 1n, 8 -> 8n, h -> 2n)

                // Iterate over notes in treble clef
                for (let j = 0; j < topNotes.length; j++)
                {
                    const sanitizedKeyTop = topNotes[j].keys[0].replace('/', '');
                    const durationTop = durationMap[topNotes[j].duration];

                    // Schedule the part to be played
                    if (!topNotes[j].duration.includes('r'))
                    {
                        topPart.add({
                            time: currentTimeTop,
                            note: sanitizedKeyTop,
                            duration: durationTop,
                            noteId: topStaveNotes[j].getSVGElement()?.getAttribute('id')
                        });
                    }

                    // Update currentTime
                    currentTimeTop += Tone.Time(durationTop).toSeconds();
                }

                // Iterate over the notes in the bass clef
                for (let j = 0; j < bottomNotes.length; j++)
                {
                    const sanitizedKeyBottom = bottomNotes[j].keys[0].replace('/', '');
                    const durationBottom = durationMap[bottomNotes[j].duration];

                    // Schedule the notes for the bass clef
                    if (!bottomNotes[j].duration.includes('r'))
                    {
                        bottomPart.add({
                            time: currentTimeBottom,
                            note: sanitizedKeyBottom,
                            duration: durationBottom,
                            noteId: bottomStaveNotes[j].getSVGElement()?.getAttribute('id')
                        });
                    }

                    // Update currentTime
                    currentTimeBottom += Tone.Time(durationBottom).toSeconds();
                }
            }

            // Configure the playback of the top and bottom parts
            topPart.callback = (time, event) => {
                synth.triggerAttackRelease(event.note, event.duration, time);

                const durationInSeconds = Tone.Time(event.duration).toSeconds();

                // Schedule the highlighting
                Tone.getDraw().schedule(() => {
                    highlightNoteStart(event.noteId);
                }, time);

                // Scheduleing de-highlighting
                Tone.getDraw().schedule(() => {
                    highlightNoteEnd(event.noteId);
                }, time + durationInSeconds);
            };

            bottomPart.callback = (time, event) => {
                synth.triggerAttackRelease(event.note, event.duration, time);

                const durationInSeconds = Tone.Time(event.duration).toSeconds();

                // Schedule highlighting
                Tone.getDraw().schedule(() => {
                    highlightNoteStart(event.noteId);
                }, time);

                Tone.getDraw().schedule(() => {
                    highlightNoteEnd(event.noteId);
                }, time + durationInSeconds);
            };

            // Start from the beginning
            topPart.start(0);
            bottomPart.start(0);

            Tone.getTransport().start();
        }
    }

    const highlightNoteStart = (noteId: string) => {
        console.log(`Highlight note start running at note id: ${noteId}`);
        d3.select(`[id="${noteId}"]`).classed('highlighted', true);
    }

    const highlightNoteEnd = (noteId: string) => {
        d3.select(`[id="${noteId}"]`).classed('highlighted', false);
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

    // Wrapper function to call removeNote
    const removeNoteHandler = (keys: string[], noteId: number) => {
        if (score && score.current)
        {
            score.current.removeNote(keys, noteId);
        }
    }

    const shiftNoteUp = (note: string) => {
        const noteSequence = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
        const [noteLetter, octave] = note.split('/');  // Example: 'C/4' -> 'C' and '4'
        let noteIndex = noteSequence.indexOf(noteLetter);
        let newOctave = parseInt(octave);
    
        // Move to the next note in the sequence
        if (noteIndex < noteSequence.length - 1) {
            noteIndex++;
        } else {
            // If the note is 'B', wrap around to 'C' and increase the octave
            noteIndex = 0;
            newOctave++;
        }
    
        // Return the new note and octave
        return `${noteSequence[noteIndex]}/${newOctave}`;
    };

    const shiftNoteDown = (note: string) => {
        const noteSequence = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
        const [noteLetter, octave] = note.split('/');
        let noteIndex = noteSequence.indexOf(noteLetter);
        let newOctave = parseInt(octave);
    
        // Move to the previous note in the sequence
        if (noteIndex > 0) {
            noteIndex--;
        } else {
            // If the note is 'C', wrap around to 'B' and decrease the octave
            noteIndex = noteSequence.length - 1;
            newOctave--;
        }
    
        // Return the new note and octave
        return `${noteSequence[noteIndex]}/${newOctave}`;
    };

    const increasePitch = () => {
        // Get all the keys from the note passed in, raise all the pitches of them, return the new array
        const newNotes: string[] = [];
        if (score && score.current)
        {
            const staveNote = score.current.findNote(selectedNoteId);
            if (staveNote)
            {
                for (let i = 0; i < staveNote.keys.length; i++)
                {
                    newNotes.push(shiftNoteUp(staveNote.keys[i]));
                }
            }
        }
        return newNotes;
    }

    const lowerPitch = () => {
        const newNotes: string[] = [];
        if (score && score.current)
        {
            const staveNote = score.current.findNote(selectedNoteId);
            if (staveNote)
            {
                for (let i = 0; i < staveNote.keys.length; i++)
                {
                    newNotes.push(shiftNoteDown(staveNote.keys[i]))
                }
            }
        }
        return newNotes;
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
            const trebleKeyToNoteMap: { [key: string]: string } = {
                'a': 'a/4',
                'b': 'b/4',
                'c': 'c/5',
                'd': 'd/5',
                'e': 'e/5',
                'f': 'f/5',
                'g': 'g/5',
            };
            const bassKeyToNoteMap: { [key: string]: string } = {
                'a': 'a/3',
                'b': 'b/3',
                'c': 'c/4',
                'd': 'd/4',
                'e': 'e/4',
                'f': 'f/4',
                'g': 'g/4',
            }

            let isTopNote: boolean = false;
            if (score && score.current)
            {
                isTopNote = score.current.isTopMeasure(selectedNoteId);
            }
            const key = event.key.toLowerCase();
            const note = (isTopNote ? trebleKeyToNoteMap[key] : bassKeyToNoteMap[key]);

            // If a valid note was pressed and we have a note selected
            if (note && selectedNoteId !== -1) {
                addNoteHandler([note], selectedNoteId);
                const nextNote = score.current?.getAdjacentNote(selectedNoteId);
                if (nextNote)
                {
                    setSelectedNoteId(nextNote);
                }
            }

            // If we press the up arrow, raise the pitch
            if (key === 'w')
            {
                const newNotes = increasePitch();
                const staveNote = score.current?.findNote(selectedNoteId);
                if (staveNote)
                {
                    removeNoteHandler(staveNote.keys, selectedNoteId);
                    addNoteHandler(newNotes, selectedNoteId);
                }
            }

            // If we press the down arrow, lower the pitch
            if (key === 's')
            {
                const newNotes = lowerPitch();
                const staveNote = score.current?.findNote(selectedNoteId);
                if (staveNote)
                {
                    removeNoteHandler(staveNote.keys, selectedNoteId);
                    addNoteHandler(newNotes, selectedNoteId);
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
      header={{ height: 180 }}
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
                    playbackComposition={playbackAwaiter}
                    stopPlayback={stopPlayback}
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
}
