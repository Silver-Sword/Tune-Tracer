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
import { 
  IconArrowDown, 
  IconArrowUp, 
  IconHeart, 
  IconHeartFilled,
  IconHelp, 
  IconSearch, 
  IconSortDescending, 
  IconUserCircle, 
} from "@tabler/icons-react";
import {STATUS, ACTIONS} from "react-joyride";
import { useRouter } from "next/navigation";

import { getUserID, getEmail, clearUserCookies } from "../cookie";
import StorageTutorial from "./storage-tutorial";
import { CreateCard } from "./CreateCard";
import { DocCard } from "./DocCard";
import { getSharedPreviews, getOwnPreviews } from "./documentPreviewsData";
import { callAPI } from "../../utils/callAPI";
import { DocumentPreview } from "../lib/src/documentProperties";

// Define filter labels for the navbar
const filterLabels = [
  { link: "", label: "My Compositions" },
  { link: "", label: "Shared with me" }
];

type SortType = "title" | "timeCreated" | "lastEdited";

// FiltersNavbar component
const FiltersNavbar: React.FC<{ getOwnPreviews: () => void, getSharedPreviews: () => void }> = ({ getOwnPreviews, getSharedPreviews }) => {
  const [activeFilter, setActiveFilter] = useState<string>("My Compositions");

  const handleFilterClick = (label: string) => {
    setActiveFilter(label);
    if (label == "My Compositions") {
      getOwnPreviews();
    }
    else if (label == "Shared with me") {
      getSharedPreviews();
    }
    console.log(`Filter selected: ${label}`);
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
const SearchBar: React.FC<{ onSearch: (term: string) => void }> = ({ onSearch }) => {
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value
    onSearch(value)
  }

  return (
    <TextInput
      variant="filled"
      radius="xl"
      size="lg"
      style={{ width: "50%" }}
      placeholder="Search compositions"
      leftSectionPointerEvents="none"
      leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} />}
      onChange={handleSearch}
      className="search-bar"
    />
  )
}

// Main storage component
export default function Storage() {
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [userId, setUID] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [passwordModalOpened, setPasswordModalOpened] = useState(false);
  const router = useRouter();
  
  const [run, setRun] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const [sortBy, setSortBy] = useState<SortType>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [onlyShowFavorites, setOnlyShowFavorites] = useState<boolean>(false);
  
  const [documents, setDocuments] = useState<DocumentPreview[]>([]);
  const [displayedDocuments, setDisplayedDocuments] = useState<DocumentPreview[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []); 
  
  useEffect(() => {
    const visibleDocuments = documents.filter((doc) => {
      return (!onlyShowFavorites || doc.is_favorited) &&
             doc.document_title.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setDisplayedDocuments(visibleDocuments);
  }, [documents, searchTerm, onlyShowFavorites]);

  // Handle tutorial callback to manage step progression and tutorial completion
  const handleJoyrideCallback = (data: any) => {

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
  
  const routeToProfilePage = () => {
    router.push(`/profile`);
  }

  const handleResetOpen = () => {
    setPasswordModalOpened(true);
  }

  const handleReset = async () => {
    const email = getEmail();
    console.log(`Resetting password for: ${email}`);
    try
    {
      await callAPI("resetUserPassword", {email: email});
    }
    catch (error)
    {
      console.log(`Error resetting password for: ${email}`);
    }
    setPasswordModalOpened(false);
  }

  const closePasswordModal = () => {
    setPasswordModalOpened(false);
  }

  const handleDocumentDelete = (documentId: string) => {
    setDocuments(documents.filter((doc) => doc.document_id !== documentId));
  } 

  const useOwnedPreviews = async () => {
    const userId = getUserID();
    setLoading(true);
    const data = await getOwnPreviews(userId);
    console.log(`Data:` + JSON.stringify(data));
    setDocuments(sortDocuments(data, sortBy, sortDirection));
    setLoading(false);
  }
  
  const useSharedPreviews = async () => {
    const userId = getUserID();
    setLoading(true);
    const data = await getSharedPreviews(userId);
    setDocuments(sortDocuments(data, sortBy, sortDirection));
    setLoading(false);
  }

  const sortDocuments = (docs: DocumentPreview[], sortType: string, direction: "asc" | "desc") => {
    return [...docs].sort((a, b) => {
      let comparison = 0;
      switch (sortType) {
        case "timeCreated":
          comparison = b.time_created - a.time_created;
          break;
        case "lastEdited":
          comparison = b.last_edit_time - a.last_edit_time;
          break;
        case "title":
          comparison = a.document_title.localeCompare(b.document_title);
          break;
        default:
          return 0;
      }
      return direction === "asc" ? -comparison : comparison;
    });
  }

  const handleSort = (type: SortType) => {
    setSortBy(type);
    setDocuments(sortDocuments(documents, type, sortDirection));
  }

  const toggleSortDirection = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    setDocuments(sortDocuments(documents, sortBy, newDirection));
  }

  const getUserName = async () => {
    await callAPI("getUserFromId", {userId: getUserID()})
      .then((res) => {
        if (res.status !== 200) {
            console.log("Error getting user data");
            return;
        }
        const user = (res.data as any);
              if(user === undefined) {
                  console.error(`Something went wrong. user is undefined`);
              }
              else {
                setDisplayName(user.display_name);
              }
      }).catch((error) => {
        console.error(`Error getting user data: ${error}`);
        return;
      });;
  }

  useEffect(() => {
    let emailCookie = getEmail();
    let userIdCookie = getUserID();
    console.log(`userIdCookie: ${userIdCookie}`);
    setEmail(emailCookie);
    setUID(userIdCookie);
    getUserName(); 
    setTimeout(async () => {
      setLoading(true);
      const data = await getOwnPreviews(userIdCookie);
      setDocuments(sortDocuments(data, sortBy, sortDirection));
      setLoading(false);
    }, 0);
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  }

  return (
    <AppShell
      header={{ height: 80 }}
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
              h={50}
              w="auto"
              fit="contain"
            />
            <SearchBar 
              onSearch={handleSearch}
            />
            <Group>
              <Tooltip label={`Help`} withArrow>
                <ActionIcon
                  className="tutorial-button"
                  radius={"xl"}
                  size={"lg"}
                  onClick={() => setRun(true)}
                >
                  <IconHelp size={"2rem"}/>
                </ActionIcon>
              </Tooltip>

              {/* Profile Menu */}
              <Menu shadow="md">
                <Menu.Target>
                <Tooltip label={`Profile`} withArrow>
                  <ActionIcon className="profile-menu" size={"lg"} radius={"xl"}>
                    <IconUserCircle size={"2rem"}/>
                  </ActionIcon>
                </Tooltip>
                </Menu.Target>

                <Menu.Dropdown style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Menu.Label style={{ fontSize: rem(13), fontWeight: 'bold' }}>{displayName}</Menu.Label>
                  <Menu.Label style={{ fontSize: rem(13), fontWeight: 'bold' }}>{email}</Menu.Label>
                  <Menu.Divider />
                  <Menu.Item
                    onClick={routeToProfilePage}
                  >
                    Profile Settings
                  </Menu.Item>
                  <Menu.Item
                    color="red"
                    onClick={handleResetOpen}
                  >
                    Reset Password
                  </Menu.Item>
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
        <Modal
          opened={passwordModalOpened}
          onClose={closePasswordModal}
          title="Confirm Password Reset"
          centered
        >
          <Text>Are you sure you want a password reset email?</Text>
          <Group 
            justify="flex-end" 
            mt="md"
            >
            <Button onClick={closePasswordModal} variant="default">
              Cancel
            </Button>
            <Button 
              onClick={handleReset} 
              color="blue"
              loading = {loading}>
              Confirm
            </Button>
          </Group>
        </Modal>
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
              <Tooltip label={onlyShowFavorites ? `Don't display only favorited` : `Display only favorited`} withArrow>
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => setOnlyShowFavorites(!onlyShowFavorites)}
              >
                  {onlyShowFavorites ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
                </ActionIcon>
              </Tooltip>
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
                  <Menu.Item onClick={() => handleSort("timeCreated")}>
                    Sort by Creation Time {sortBy === "timeCreated" && "✓"}
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
          {
            documents.length === 0 ? (
              <Text size="lg" color="black" fw={700}>
                No Scores Here Yet!
              </Text>
            ) : 
            (
              displayedDocuments.length === 0 ? (
                <Text size="lg" color="black" fw={700}>
                  No scores match your filter criteria.
                </Text>
            ) :
            (
              <SimpleGrid
                cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
                spacing={{ base: "xl" }}
              >
              {displayedDocuments.map((doc) => (
                <DocCard 
                  key={doc.document_id} 
                  last_edit_user={doc.last_edit_user} 
                  document_id={doc.document_id} 
                  document_title={doc.document_title} 
                  owner_id={doc.owner_id} 
                  last_edit_time={doc.last_edit_time} 
                  time_created={doc.time_created}
                  is_favorited={doc.is_favorited}
                  preview_color={doc.preview_color}
                  original_preview_object={doc}
                  onDelete={() => handleDocumentDelete(doc.document_id)}
                />
              ))}
              </SimpleGrid>
          ))}
        </>
      )}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
