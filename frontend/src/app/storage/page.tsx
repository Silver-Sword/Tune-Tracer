"use client";

import React, { useState } from "react";
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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";

// Define filter labels for the navbar
const filterLabels = [
  { link: "", label: "All" },
  { link: "", label: "Shared with you" },
  { link: "", label: "Favorites" },
  { link: "", label: "Recents" },
  { link: "", label: "A-Z" },
];

// FiltersNavbar component
const FiltersNavbar: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const handleFilterClick = (label: string) => {
    setActiveFilter(label);
    console.log(`Filter selected: ${label}`);
    // Add more filtering logic here
  };

  return (
    <AppShell.Navbar p="xl">
      <Stack gap="xs">
        {filterLabels.map((filter) => (
          <Button
            key={filter.label}
            variant={activeFilter === filter.label ? "filled" : "outline"}
            fullWidth
            onClick={() => handleFilterClick(filter.label)}
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
      placeholder="Search compositions"
      leftSectionPointerEvents="none"
      leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} />}
      onChange={handleSearch}
    />
  );
};

// CreateCard component
const CreateCard: React.FC = () => {
  const [inviteCode, setInviteCode] = useState("");
  const [opened, { toggle }] = useDisclosure(false);

  const handleCreateDocument = () => {
    console.log("Create document clicked");
  };

  const handleInviteCodeChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setInviteCode(event.target.value);
  };

  const handleJoinWithCode = () => {
    console.log("Join with invite code:", inviteCode);
  };

  return (
    <Card
      shadow="md"
      padding="lg"
      radius="md"
      withBorder
      style={{
        maxWidth: 400,
        minHeight: 200, // Ensures minimum height matches DocCard
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between", // Ensure content spreads evenly
      }}
    >
      <Stack>
        {/* THE HREF IS TEMPORARY FOR DEMO */}
        {/* Probably needs a handleDocumentCreation to push a new document into the user that creates this */}
        <Button component="a" href="/composition_tool" fullWidth onClick={handleCreateDocument}>
          Create New Document
        </Button>

        <Text size="sm" color="dimmed">
          or
        </Text>

        <TextInput placeholder="Enter invite code" value={inviteCode} onChange={handleInviteCodeChange} />

        <Button size="sm" color="green" onClick={handleJoinWithCode}>
          Join with Code
        </Button>
      </Stack>
    </Card>
  );
};

// DocCard Component
const DocCard: React.FC = () => {
  return (
    <Card
      shadow="md"
      padding="lg"
      radius="md"
      withBorder
      style={{
        maxWidth: 400,
        minHeight: 200, // Ensures consistent height with CreateCard
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between", // Ensure consistent spacing
      }}
    >
      <Stack>
        {/* Truncate title text to prevent overflow */}
        <Text lineClamp={3}>
          This is a document card. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis tincidunt arcu a ex laoreet, nec aliquam leo fermentum.
        </Text>
        {/* Add more content like document info, actions, etc. */}
      </Stack>
    </Card>
  );
};

// Main storage component
export default function Storage() {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
      }}
      padding="md"
    >
      <AppShell.Main>
        <AppShell.Header
          style={{
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Group justify="space-between" px="lg">
            <Text>Tune Tracer</Text>
            <SearchBar />
            {/* THIS IS A PLACEHOLDER FOR DEMO AND WILL BE POPULATED WITH USER EMAIL */}
            <Button component="a" href="/login">
              user123456789@outlook.example.com
            </Button>
          </Group>
        </AppShell.Header>

        <FiltersNavbar />

        <Container
          fluid
          size="responsive"
          style={{
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            // background: "#f0f8ff",  

            // background: "linear-gradient(180deg, rgba(154,215,255,1) 0%, rgba(0,105,182,1) 100%)",
          }}
        >
          <Space h="xl"></Space>

          {/* Updated SimpleGrid with responsive breakpoints */}
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3, lg: 5}}
            spacing={{ base: "lg"}}
          >
            <CreateCard />
            
            <DocCard />
            <DocCard />
            <DocCard />
            <DocCard />
            <DocCard />
            <DocCard />
            <DocCard />
            {/* Uncomment to see card behaviors for storage page */}
            {/* {documents.map((document) =>(
              <DocCard key={document.id} document={document} toggleFavorite={toggleFavorite} />
            ))} */}
          </SimpleGrid>
          <Space h="xl"></Space>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
