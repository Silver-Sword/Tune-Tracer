"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  AppShell,
  Container,
  Text,
  Button,
  Card,
  Group,
  Space,
  TextInput,
  Stack,
  SimpleGrid,
  rem,
  Modal,
  Image,
  Tooltip,
  Menu,
  Divider,
} from "@mantine/core";
import Joyride, { CallBackProps, STATUS } from "react-joyride";

import { IconSearch, IconHeart, IconHeartFilled, IconTrash } from "@tabler/icons-react";
import { getUserID, getDisplayName, getEmail, clearUserCookies, saveDocID } from "../cookie";
import { useRouter } from "next/navigation";
import { CreateCard } from "./CreateCard";
import { DocCard, DocumentData } from "./DocCard";
import { getSharedPreviews, getOwnPreviews } from "./documentPreviewsData";

// Define filter labels for the navbar
const filterLabels = [
  { link: "", label: "All" },
  { link: "", label: "Shared with you" },
  { link: "", label: "Favorites" },
  { link: "", label: "Recents" },
  { link: "", label: "A-Z" },
];

const tutorialSteps = [
  { target: ".search-bar", content: "Search for compositions here." },
  { target: ".create-card", content: "Create a new score or join with an invite code." },
  { target: ".navbar-filters", content: "Filter your compositions here." },
  { target: ".profile-menu", content: "Access your profile settings and logout here." },
];

// FiltersNavbar component
const FiltersNavbar: React.FC<{ getOwnPreviews: () => void, getSharedPreviews: () => void }> = ({ getOwnPreviews, getSharedPreviews }) => {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const handleFilterClick = (label: string) => {
    setActiveFilter(label);
    if (label == "All") {
      getOwnPreviews();
    }
    else if (label == "Shared with you") {
      getSharedPreviews();
    }
    console.log(`Filter selected: ${label}`);
    // Add more filtering logic here
  };

  return (
    <AppShell.Navbar p="xl">
      <CreateCard userId={getUserID()} />
      <Space h="lg"></Space>
      <Divider/>
      <Space h="lg"></Space>
      <Stack gap="xs">
        {filterLabels.map((filter) => (
          <Button
            key={filter.label}
            variant={activeFilter === filter.label ? "filled" : "outline"}
            fullWidth
            onClick={() => handleFilterClick(filter.label)}
            className="filter-button"
          >
            {filter.label}
          </Button>
        ))}
      </Stack>
    </AppShell.Navbar>
  );
};

// SearchBar component
const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event: { currentTarget: { value: any } }) => {
    const value = event.currentTarget.value;
    setSearchTerm(value);
    console.log(`Searching for: ${value}`);
    // Add more search logic here
  };

  return (
    <TextInput
      variant="filled"
      radius="xl"
      size ="lg"
      style={{ width: "50%"}}
      placeholder="Search compositions"
      leftSectionPointerEvents="none"
      leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} />}
      onChange={handleSearch}
      className="search-bar"
    />
  );
};


// Main storage component
export default function Storage() {
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [userId, setUID] = useState<string>('');
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const router = useRouter();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Something is wrong with the callback, not allowing to move forward in states
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
    } else {
      setStepIndex(index);
    }
  };

  const handleLogout = () => {
    console.log(`Successfully logged out of: ${email}`);
    clearUserCookies();
    router.push(`/`);
  }

  const useOwnedPreviews = async () => {
    const userId = getUserID();
    const data = await getOwnPreviews(userId);
    setDocuments(data);
  }
  
  const useSharedPreviews = async () => {
    const userId = getUserID();
    const data = await getSharedPreviews(userId);
    setDocuments(data);
  }

  useEffect(() => {
    let displayCookie = getDisplayName();
    let emailCookie = getEmail();
    let userIdCookie = getUserID();
    console.log(`userIdCookie: ${userIdCookie}`);
    setDisplayName(displayCookie);
    setEmail(emailCookie);
    setUID(userIdCookie);
    setTimeout(async () => {
      const data = await getOwnPreviews(userIdCookie);
      setDocuments(data);
    }, 0);
  }, []);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 350,
        breakpoint: "sm",
      }}
      padding="md"
    >
      <Joyride
        steps={tutorialSteps}
        run={run}
        stepIndex={stepIndex}
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
      />
      <AppShell.Main>
        <AppShell.Header
          style={{
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Group justify="space-between" px="lg">
            <Image
              src="/TuneTracerLogo.png" // Path to your image
              alt="Description of the image"
              fit="contain" // Optional: can be 'contain', 'cover', or 'fill'
              width={50} // Optional: Set the width
              height={50} // Optional: Set the height
            />
            <SearchBar />
            <Group>
              <Button onClick={() => setRun(true)}>Help</Button>
              {/* Profile Menu */}
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Button className="profile-menu" size="sm">{displayName}</Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label style={{ fontSize: rem(13), fontWeight: 'bold' }}>{email}</Menu.Label>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    onClick={handleLogout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </AppShell.Header>
        <FiltersNavbar getOwnPreviews={useOwnedPreviews} getSharedPreviews={useSharedPreviews} />

        <Container
          fluid
          size="responsive"
          style={{
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
          }}
        >
          <Text style={{ textAlign: 'left', fontSize: '2rem', fontWeight: 'bold' }}>
            Scores
          </Text>
          <Space h="xl"></Space>
          {/* Updated SimpleGrid with responsive breakpoints */}
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3, lg: 5 }}
            spacing={{ base: "xl" }}
          >

            {documents.map((doc) => (
              <DocCard 
                key={doc.document_id} 
                last_edit_user={doc.last_edit_user} 
                document_id={doc.document_id} 
                document_title={doc.document_title} 
                owner_id={doc.owner_id} 
                last_edit_time={doc.last_edit_time} 
              />
            ))}
          </SimpleGrid>
          <Space h="xl"></Space>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
