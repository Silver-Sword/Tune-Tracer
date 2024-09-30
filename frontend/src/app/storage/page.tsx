"use client";

import React, { useState } from "react";
import {
  AppShell,
  Container,
  Text,
  Button,
  Card,
  Grid,
  Image,
  Title,
  Center,
  Group,
  Space,
  TextInput,
  Skeleton,
  Code,
  rem,
  Stack,
  SimpleGrid,
} from "@mantine/core";
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

  const handleSearch = (event) => {
    const value = event.currentTarget.value;
    setSearchTerm(value);
    console.log(`Searching for: ${value}`);
    // Add more search logic here
  };

  return (
    <TextInput
      variant="filled"
      size="sm"
      radius="xl"
      placeholder="Search compositions"
      leftSectionPointerEvents="none"
      leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} />}
      onChange={handleSearch}
    />
  );
};

// InviteCard component
const InviteCard: React.FC = () => {
    const [inviteCode, setInviteCode] = useState("");
  
    const handleCreateDocument = () => {
      console.log("Create document clicked");
    };
  
    const handleInviteCodeChange = (event) => {
      setInviteCode(event.target.value);
    };
  
    const handleJoinWithCode = () => {
      console.log("Join with invite code:", inviteCode);
    };
  
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder style={{ maxWidth: 400, margin: '0 auto' }}>
        <Stack>
          <Button fullWidth onClick={handleCreateDocument}>
            Create Document
          </Button>
  
          <TextInput
            placeholder="Enter invite code"
            value={inviteCode}
            onChange={handleInviteCodeChange}
          />
  
          <Button fullWidth onClick={handleJoinWithCode}>
            Join with Code
          </Button>
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
            breakpoint: 'sm',
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
          <Button component="a" href="/login">
            Profile
          </Button>
        </Group>
      </AppShell.Header>

      <FiltersNavbar />

      
        <Container
          fluid
          style={{
            height: "70vh",
            weight: "100vw",
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            background:
              "linear-gradient(180deg, rgba(154,215,255,1) 0%, rgba(0,105,182,1) 100%)",
          }}
        >
            <Text size="xl" mb="xl">
                Compositions
            </Text>

            {/* Grid showing compositions
                Needs logic to show documents as cards + create always at beginning */}
            {/* Current cards are place holders to see behaviors */}
            <SimpleGrid cols={5}>
                
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>
                <InviteCard/>


            </SimpleGrid>



        </Container>
        <Space h="xl"></Space>
        
        <Container size="xl"></Container>
      </AppShell.Main>
    </AppShell>
  );
}
