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
  Tooltip,
  Menu,
} from "@mantine/core";

import { IconSearch, IconHeart, IconHeartFilled, IconTrash } from "@tabler/icons-react";
import { getUserID, getDisplayName, getEmail, clearUserCookies, saveDocID } from "../cookie";
import { useRouter } from "next/navigation";
import { CreateCard} from "./CreateCard";
import { DocCard, DocumentData} from "./DocCard";



// Define filter labels for the navbar
const filterLabels = [
  { link: "", label: "All" },
  { link: "", label: "Shared with you" },
  { link: "", label: "Favorites" },
  { link: "", label: "Recents" },
  { link: "", label: "A-Z" },
];

// FiltersNavbar component
const FiltersNavbar: React.FC<{getOwnPreviews: () => void, getSharedPreviews: () => void}> = ({getOwnPreviews, getSharedPreviews}) => {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const handleFilterClick = (label: string) => {
    setActiveFilter(label);
    if (label == "All")
    {
      getOwnPreviews();
    }
    else if (label == "Shared with you")
    {
      getSharedPreviews();
    }
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


// Main storage component
export default function Storage() {
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [userId, setUID] = useState<string>('');
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const handleLogout = () => {
    console.log(`Successfully logged out of: ${email}`);
    clearUserCookies();
  }

  useEffect(() => {
    let displayCookie = getDisplayName();
    let emailCookie = getEmail();
    let userIdCookie = getUserID();
    console.log(`userIdCookie: ${userIdCookie}`);
    setDisplayName(displayCookie);
    setEmail(emailCookie);
    setUID(userIdCookie);
    setTimeout(() => {
      getOwnPreviews2(userIdCookie);
    }, 0)
    // getOwnPreviews();
  }, []);

  const GET_OWN_PREV = 'https://us-central1-l17-tune-tracer.cloudfunctions.net/getOwnedPreviews';
  const GET_SHARE_PREV = 'https://us-central1-l17-tune-tracer.cloudfunctions.net/getSharedPreviews';

  const getOwnPreviews = async () => {
    const userInfo2 = {
      userId: userId,
    }
    const reqOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInfo2)
    }
    fetch(GET_OWN_PREV, reqOptions)
      .then((res) => {
        if (res.status == 200)
        {
          res.json().then((val) => {
            console.log(val['data']);
            setDocuments(val['data']);
          })
        }
      })
  }

  const getOwnPreviews2 = async (userId: string) => {
    const userInfo2 = {
      userId: userId,
    }
    const reqOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInfo2)
    }
    fetch(GET_OWN_PREV, reqOptions)
      .then((res) => {
        if (res.status == 200)
        {
          res.json().then((val) => {
            console.log(val['data']);
            setDocuments(val['data']);
          })
        }
      })
  }

  const getSharedPreviews = async () => {
    const userInfo2 = {
      userId: userId,
    }
    const reqOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInfo2)
    }
    fetch(GET_SHARE_PREV, reqOptions)
      .then((res) => {
        if (res.status == 200)
        {
          res.json().then((val) => {
            console.log(val['data']);
            setDocuments(val['data']);
          })
        }
      })
  }

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

            {/* Profile Menu */}
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button>{displayName}</Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>{email}</Menu.Label>
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
        </AppShell.Header>
        <FiltersNavbar getOwnPreviews={getOwnPreviews} getSharedPreviews={getSharedPreviews}/>

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
          <Space h="xl"></Space>

          {/* Updated SimpleGrid with responsive breakpoints */}
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3, lg: 5}}
            spacing={{ base: "xl"}}
          >
            <CreateCard userId={userId} />

            {documents.map((doc) => (
              <DocCard key={doc.document_id} last_edit_user={doc.last_edit_user} document_id={doc.document_id} document_title={doc.document_title} owner_id={doc.owner_id} last_edit_time={doc.last_edit_time}/>
            ))}
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
