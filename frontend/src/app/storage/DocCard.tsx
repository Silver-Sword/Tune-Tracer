import { saveDocID } from "../cookie";
import { format } from 'date-fns';
import React, {useState } from "react";
import { useRouter } from "next/navigation";
import {IconHeart, IconHeartFilled, IconTrash } from "@tabler/icons-react";
import {
    Text,
    Button,
    Card,
    Group,
    Stack,
    Modal,
    Tooltip,
  } from "@mantine/core";
import { title } from "process";


 export interface DocumentData {
    last_edit_time: number;
    owner_id: string;
    last_edit_user: string;
    document_id: string;
    document_title: string;
  }

// DocCard Component
export const DocCard: React.FC<DocumentData> = ({document_id, document_title, owner_id, last_edit_time}) => {
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

  const returnTitle = () => {
    if(document_title === "") document_title = "Untitled";
    return document_title
  }

  function millisecondsToFormattedDateString(ms: number): string {
    const date = new Date(ms);
    return format(date, 'yyyy-MM-dd'); // Customize the format as needed
}

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
          <Text size="lg">{returnTitle()}</Text>
          {/* <Text size="md">Created by: {owner_id}</Text> */}
          <Text size="sm" c="dimmed">Date Last Edited: {millisecondsToFormattedDateString(last_edit_time)}</Text>
        </Stack>
      </Card>
    </>
  );
};