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

// Sharing Modal Component
const SharingModal: React.FC = () => {
  // Sharing logic here
  const [openShare, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal
        opened={openShare}
        onClose={close}
        title="Share: [Document Name]"
        centered
      >
        {/* Modal content */}
        <TextInput placeholder="Add collaborators by email here"></TextInput>
        <Space h="sm" />
        <Text>Collaborators</Text>

        <Divider size="sm" my="sm"></Divider>

        <Text>Code Access</Text>

        <Divider size="sm" my="sm"></Divider>

        <Text>Link Access</Text>
        <></>

        {/* Replace value with the colab link */}
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
      </Modal>
      <Button onClick={open}>Share</Button>
      {/* Profile Icon */}
    </>
  );
};

const ToolbarHeader: React.FC = () => {
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
          placeholder="Select Mode"
          allowDeselect={false}
          withCheckIcon={false}
          style={{ width: 150, marginLeft: '10px' }}
        />
        <SharingModal />
      </Group>

      {/* Second layer (middle section) */}
      <Group align="center" mt="xs" style={{ paddingBottom: "10px" }}>
        <Tabs defaultValue="notes">
          <Tabs.List>
            <Tabs.Tab value="notes">Notes</Tabs.Tab>
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

  useEffect(() => {
    const clearSVG = () => {
      if (notationRef.current) {
        notationRef.current.innerHTML = "";
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
}
