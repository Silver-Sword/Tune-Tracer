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
import { useDisclosure } from "@mantine/hooks";
import { IconSearch, IconHeart, IconHeartFilled, IconTrash } from "@tabler/icons-react";
import { getUserID, getDisplayName, getEmail, clearUserCookies, saveDocID } from "../cookie";
import { useRouter } from "next/navigation";
import { updateDo } from "typescript";

interface DocumentData {
  last_edit_time: number;
  owner_id: string;
  last_edit_user: string;
  document_id: string;
  document_title: string;
}

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

// CreateCard component

// TODO: make the join w code button responsive if invalid code apart from no code is entered
const CreateCard: React.FC<{userId: string}> = (userId) => {
  const [inviteCode, setInviteCode] = useState("");
  const [opened, { toggle }] = useDisclosure(false);
  const router = useRouter();

  const CREATE_DOCUMENT_URL = 'https://us-central1-l17-tune-tracer.cloudfunctions.net/createDocument';
  const UPDATE_SHARE_STYLE = 'https://us-central1-l17-tune-tracer.cloudfunctions.net/updateDocumentShareStyle';

  const handleCreateDocument = () => {
    console.log("Create document clicked");
    try {
      // const userInfo = {
      //   userId: userId
      // }
      const requestOptions =
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userId),
      }

      fetch(CREATE_DOCUMENT_URL, requestOptions)
        .then((res) => {
          if (res.status == 200)
          {
            let documentId;
            res.json().then((value) => {
              // document.metadata.document_id
              documentId = value['data'].metadata.document_id;
              saveDocID(documentId);
              console.log(`DocumentId: ${documentId}`);
              updateDocumentShareStyle(documentId);

              router.push(`/composition_tool?id=${documentId}`);
            })
          }
          else if (res.status == 500)
          {
            res.json().then((value) => {
              console.log(value['message']);
            })
          }
        })
    }
    catch (error: any) {
      console.log(`Error: ${error.message}`);
    }
  };

  const updateDocumentShareStyle = (document_id: string) => {
    console.log("Create document clicked");
    try {
      const userInfo = {
        writerId: userId.userId,
        documentId: document_id,
        sharing: 4,
        // ShareStyle.WRITE
      }
      const requestOptions =
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo),
      }

      fetch(UPDATE_SHARE_STYLE, requestOptions)
        .then((res) => {
          if (res.status == 200)
          {
            // We are good
          }
          else if (res.status == 500)
          {
            res.json().then((value) => {
              console.log(value['message']);
            })
          }
        })
    }
    catch (error: any) {
      console.log(`Error: ${error.message}`);
    }
  };

  const handleInviteCodeChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setInviteCode(event.target.value);
  };

  const [error, setError] = useState('');

  const handleJoinWithCode = async () => {
    const shareCode = {shareCode: inviteCode};
    const USE_SHARE_CODE = 'https://us-central1-l17-tune-tracer.cloudfunctions.net/getDocumentIdFromShareCode';
    // console.log(JSON.stringify("shareCode": shareCode));
    const PUT_OPTION = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(shareCode),
    }
    fetch(USE_SHARE_CODE, PUT_OPTION).then((res) => {
      res.json().then((value) => {
        if (res.status == 200)
          {
            console.log("Successfully joined with invite code:", value['data']);
            console.log("Join with invite code:", inviteCode);
            saveDocID(value['data']);
            router.push('/composition_tool');
          }
          else if (res.status == 500)
          {
            setError(`Error: ${value['message']}`);
            console.log(error);
            throw new Error(`Error: ${value['message']}`);
          }
      }).catch((error) => {
        setError(`${error.message}`);
      });
    });
  };

  return (
    <Card
      shadow="md"
      padding="lg"
      radius="md"
      withBorder
      style={{
        maxWidth: 375,
        minHeight: 200, // Ensures minimum height matches DocCard
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between", // Ensure content spreads evenly
      }}
    >
      <Stack>
        {/* THE HREF IS TEMPORARY FOR DEMO */}
        {/* Probably needs a handleDocumentCreation to push a new document into the user that creates this */}
        <Button fullWidth onClick={handleCreateDocument}>
          New Document
        </Button>

        <Text size="sm" color="dimmed">
          or
        </Text>

        <TextInput placeholder="Enter invite code" value={inviteCode} onChange={handleInviteCodeChange} />

        <Button
          size="sm"
          color="green"
          onClick={handleJoinWithCode}
          disabled={!inviteCode.trim()} // Disable if the invite code is empty or contains only spaces
        >
          Join with Code
        </Button>
      </Stack>
    </Card>
  );
};

// DocCard Component
const DocCard: React.FC<DocumentData> = ({document_id, document_title, owner_id, last_edit_time}) => {
  const [isFavorited, setIsFavorited] = useState(false); // State to track if the card is favorited
  const [deleteModalOpened, setDeleteModalOpened] = useState(false); // State for the delete confirmation modal
  const router = useRouter();

  // Toggle favorite state
  const toggleFavorite = () => {
    setIsFavorited((prev) => !prev);
  };

  // Open delete confirmation modal
  const openDeleteModal = () => {
    setDeleteModalOpened(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModalOpened(false);
  };

  // Handle card deletion (only proceed after confirmation)
  const handleDelete = () => {
    console.log('Document deleted');
    setDeleteModalOpened(false); // Close modal after deletion
  };

  const handleDocumentOpen = () => {
    saveDocID(document_id);
    console.log(`Document opened: ${document_id}`);
    router.push(`/composition_tool?id=${document_id}`);

    // Navigates to /document/{documentId}
  };

  // const documentTitle = "[DOCUMENT NAME] OVERFLOW TEST TEXT: This is a document card. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis tincidunt arcu a ex laoreet, nec aliquam leo fermentum."

  return (
    <>
      {/* Delete confirmation modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Confirm Deletion"
        centered
      >
        <Text>Are you sure you want to delete {document_title}?</Text>
        <Group 
          justify="flex-end" 
          mt="md"
          >
          <Button onClick={closeDeleteModal} variant="default">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="red">
            Delete
          </Button>
        </Group>
      </Modal>

      {/* Card content */}
      <Card
        shadow="md"
        padding="lg"
        radius="md"
        withBorder
        style={{
          maxWidth: 375,
          minHeight: 200, // Ensures consistent height with CreateCard
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          cursor: 'pointer',
        }}
        onClick={handleDocumentOpen}
      >
        <Stack 
          style={{ paddingTop: '25px' /* Add padding to avoid button overlap */ }}
          gap="xs"
          align="flex-start"
        >
          {/* Favorite and Delete buttons */}
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: '8px' }}>
            {/* Favorite button */}
            <Button
              variant="subtle"
              onClick={toggleFavorite}
              style={{
                padding: 0, // Remove padding to make the button size smaller
              }}
            >
              {isFavorited ? (
                <IconHeartFilled size={18} color="red" />
              ) : (
                <IconHeart size={18} />
              )}
            </Button>

            {/* Delete button */}
            <Button
              variant="subtle"
              onClick={openDeleteModal}
              style={{
                padding: 0, // Remove padding to make the button size smaller
              }}
            >
              <IconTrash size={18} />
            </Button>
          </div>

          {/* Truncate title text to prevent overflow */}
          {/* Tooltip for the title to show full text on hover */}
          <Tooltip label={`Open: ${document_title}`} withArrow>
            <Text 
              lineClamp={2}
              style={{ cursor: 'pointer'}}
              onClick={handleDocumentOpen}
              >
              {document_title}
            </Text>
          </Tooltip>
          <Text size="md">Created by: {owner_id}</Text>
          <Text size="sm" c="dimmed">Date Last Edited: {last_edit_time}</Text>
        </Stack>
      </Card>
    </>
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
