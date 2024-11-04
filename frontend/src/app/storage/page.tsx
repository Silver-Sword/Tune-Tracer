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
  ActionIcon,
  Center,
  Loader,
} from "@mantine/core";
import StorageTutorial from "./storage-tutorial";
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS} from "react-joyride";
import { IconSearch, IconSortDescending, IconArrowUp, IconArrowDown} from "@tabler/icons-react";
import { getUserID, getDisplayName, getEmail, clearUserCookies, saveDocID } from "../cookie";
import { useRouter } from "next/navigation";
import { CreateCard } from "./CreateCard";
import { DocCard, DocumentData } from "./DocCard";
import { getSharedPreviews, getOwnPreviews } from "./documentPreviewsData";

// Define filter labels for the navbar
const filterLabels = [
  { link: "", label: "All" },
  { link: "", label: "Shared with you" },
  // { link: "", label: "Favorites" },
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
  const [sortBy, setSortBy] = useState<string>("lastEdited");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  
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
    // const { status, index, action, type } = data;
    // console.log('data', data);

    // console.log(`Joyride callback: ${status}, ${index}`);
    // if (([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as string[]).includes(type)) {
    //   console.log('inside if');
    //   setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1)); // Update to the next step
    // }
    // else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
    //   console.log('inside else if');
    //   setRun(false); // Stop tutorial
    // } else {
    //   console.log('inside else');
    // }

    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
  
    if (finishedStatuses.includes(status)) {
      setRun(false);
    }
  };

  const handleLogout = () => {
    console.log(`Successfully logged out of: ${email}`);
    clearUserCookies();
    router.push(`/`);
  }

  const useOwnedPreviews = async () => {
    const userId = getUserID();
    setLoading(true);
    const data = await getOwnPreviews(userId);
    setLoading(false);
    setDocuments(sortDocuments(data, sortBy, sortDirection));
  }
  
  const useSharedPreviews = async () => {
    const userId = getUserID();
    setLoading(true);
    const data = await getSharedPreviews(userId);
    setLoading(false);
    setDocuments(sortDocuments(data, sortBy, sortDirection));
  }

  const sortDocuments = (docs: DocumentData[], sortType: string, direction: "asc" | "desc") => {
    return [...docs].sort((a, b) => {
      let comparison = 0;
      switch (sortType) {
        case "lastEdited":
          comparison = b.last_edit_time - a.last_edit_time;
          break;
        case "title":
          comparison = a.document_title.localeCompare(b.document_title);
          break;
        default:
          return 0;
      }
      return direction === "asc" ? comparison : -comparison;
    });
  }

  const handleSort = (type: string) => {
    setSortBy(type);
    setDocuments(sortDocuments(documents, type, sortDirection));
  }

  const toggleSortDirection = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    setDocuments(sortDocuments(documents, sortBy, newDirection));
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
      setDocuments(sortDocuments(data, sortBy, sortDirection));
    }, 0);
  }, []);

  const getSortLabel = () => {
    return sortBy === "lastEdited" ? "Last Edited" : "Title";
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 350,
        breakpoint: "sm",
      }}
      padding="md"
    >
      {isClient && (
        <StorageTutorial
        run={run}
        // stepIndex={stepIndex}
        onCallback={handleJoyrideCallback}
      />)}
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
              src="/TuneTracerLogo.png"
              alt="TuneTracer Logo"
              fit="contain"
              width={50}
              height={50}
            />
            <SearchBar />
            <Group>

              <Button 
                className="tutorial-button"
                onClick={() => setRun(true)}
              >
                  Help
              </Button>

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
          <Group justify="space-between" align="center">
            <Text style={{ textAlign: 'left', fontSize: '2rem', fontWeight: 'bold' }}>
              Scores
            </Text>
            <Group>
              <Tooltip label={`Reverse sort direction`} withArrow>
                <ActionIcon 
                  variant="subtle" 
                  onClick={toggleSortDirection}
                  size="lg"
                >
                  {sortDirection === "asc" ? <IconArrowUp size={20} /> : <IconArrowDown size={20} />}
                </ActionIcon>
              </Tooltip>
              <Menu>
                <Tooltip label={`Sort by`} withArrow>
                  <Menu.Target>
                    <ActionIcon variant="subtle" size="lg">
                      <IconSortDescending size={30} />
                    </ActionIcon>
                  </Menu.Target>
                </Tooltip>
                <Menu.Dropdown>
                  <Menu.Item onClick={() => handleSort("title")}>
                    Sort by Title {sortBy === "title" && "✓"}
                  </Menu.Item>
                  <Menu.Item onClick={() => handleSort("lastEdited")}>
                    Sort by Last Edited {sortBy === "lastEdited" && "✓"}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
          <Space h="xl" />
          {loading ? (
        <Center style={{ height: '20vh' }}>
          <Loader />
        </Center>
      ) : (
        <>
          {documents.length === 0 ? (
            <Text size="lg" color="black" fw={700}>
              No Scores Here Yet!
            </Text>
          ) : (
            <SimpleGrid
              cols={{ base: 1, sm: 3, md: 3, lg: 5 }}
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
                  time_created={doc.time_created}
                />
              ))}
            </SimpleGrid>
          )}
        </>
      )}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
