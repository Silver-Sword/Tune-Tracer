"use client";

import React, { useState } from "react";
import {
  AppShell,
  Container,
  Text,
  Button,
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

// Main storage component
export default function Storage() {
  return (
    <AppShell padding="md" header={{ height: 60 }}>
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

      <AppShell.Main>
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



        </Container>
        <Space h="xl"></Space>
        
        <Container size="xl"></Container>
      </AppShell.Main>
    </AppShell>
  );
}
