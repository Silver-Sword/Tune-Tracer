import { format } from 'date-fns';
import React, {useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {IconHeart, IconHeartFilled, IconTrash, IconDotsVertical } from "@tabler/icons-react";
import {
    Text,
    Button,
    Card,
    Group,
    Stack,
    Modal,
    Tooltip,
    Space,
    Popover,
    ColorPicker,
  } from "@mantine/core";
import { title } from "process";

import { callAPI } from "../../utils/callAPI";
import { getUserID, saveDocID } from "../cookie";

 export interface DocumentData {
    last_edit_time: number;
    time_created: number;
    owner_id: string;
    last_edit_user: string;
    document_id: string;
    document_title: string;
  }

  const colorPresets = [
    "#f44336", "#e91e63", "#9c27b0", "#673ab7", 
    "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", 
    "#009688", "#4caf50", "#8bc34a", "#cddc39",
    "#ffeb3b", "#ffc107", "#ff9800", "#ff5722"
  ];

// DocCard Component
export const DocCard: React.FC<DocumentData> = ({document_id, document_title, owner_id, last_edit_time, time_created}) => {
  
  const [deleteModalOpened, setDeleteModalOpened] = useState(false); // State for the delete confirmation modal
  const [loading, setLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [displayName, setDisplayName] = useState("Unknown User");
  const [docTitle, setDocTitle] = useState("Untitled Document");
  const router = useRouter();
  
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#0b9be3");

  const openPopover = (event: React.MouseEvent) => {
    event.stopPropagation();
    setPopoverOpened((o) => !o);
  };

  // Function to handle background color change
  const handleColorChange = (color: string) => {
    stopPropagation();
    setBackgroundColor(color);
  };

  // Toggle favorite state
  const [isFavorited, setIsFavorited] = useState(false); // State to track if the card is favorited (modify to take apis maybe)
  const toggleFavorite = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsFavorited((prev) => !prev);
    // Call API to update favorite status (Sophia)
  };

  // Open delete confirmation modal
  const openDeleteModal = (event: React.MouseEvent) => {
    event.stopPropagation();
    setDeleteModalOpened(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModalOpened(false);
  };

  // Handle card deletion (only proceed after confirmation)
  const handleDelete = async () => {
    console.log('Document deleted');
    
    const userId = getUserID();
    const input = {
      documentId: document_id, 
      userId: userId
    }
    console.log(`Delete Document Input: ${JSON.stringify(input)}`);
    setLoading(true);
    await callAPI("deleteDocument", input);
    setLoading(false);
    setDeleted(true);
    setDeleteModalOpened(false); // Close modal after deletion
    router.push("/storage");
  };

  const handleDocumentOpen = () => {
    saveDocID(document_id);
    console.log(`Document opened: ${document_id}`);
    router.push(`/composition_tool?id=${document_id}`);

    // Navigates to /document/{documentId}
  };

  function millisecondsToFormattedDateString(ms: number): string {
    const date = new Date(ms);
    return format(date, 'MMMM dd, yyyy');  // Customize the format as needed
}

const getUserName = async () => {
  await callAPI("getUserFromId", {userId: owner_id})
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
  getUserName();
  if (document_title !== "")
  {
    setDocTitle(document_title);
  }
});


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
        <Text>Are you sure you want to delete {docTitle}?</Text>
        <Group 
          justify="flex-end" 
          mt="md"
          >
          <Button onClick={closeDeleteModal} variant="default">
            Cancel
          </Button>
          <Button 
          onClick={handleDelete} 
          color="red"
          loading = {loading}>
            Delete
          </Button>
        </Group>
      </Modal>

      {/* Card content */}
      {!deleted && <Card
        shadow="md"
        padding="lg"
        radius="md"
        withBorder
        style={{
          minWidth: 200,
          minHeight: 200, // Ensures consistent height with CreateCard
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          cursor: "pointer",
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

            {/* Popover for options */}            
            <Popover opened={popoverOpened} onChange={setPopoverOpened} withArrow>
              <Popover.Target>
                <Button
                  variant="subtle"
                  onClick={openPopover}
                  style={{
                    padding: 0, // Remove padding to make the button size smaller
                  }}
                >
                  <IconDotsVertical size={18} />
                </Button>
              </Popover.Target>
              
              {/* Popover content
                  [X] Color Picker 
                  [] Title editor
              */}
              {/* FIX STUPID PROPAGATION ERROR */}
              <Popover.Dropdown>
                <Text size="sm">Color</Text>
                {/* <Group gap="xs" mt="xs">
                  {colorPresets.map((color) => (
                    <Button
                      key={color}
                      style={{ backgroundColor: color, width: 24, height: 24, padding: 0 }}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </Group> */}
                <ColorPicker
                  onColorSwatchClick={handleColorChange}
                  size='sm'
                  format='hex'
                  swatchesPerRow={5}
                  swatches={colorPresets}
                />
              </Popover.Dropdown>

            </Popover>


          </div>


          {/* Displaying document data */}

          {/* Truncate title text to prevent overflow */}
          <Tooltip label={docTitle} withArrow>
            <Text
                size="lg"
                lineClamp={1}
                style={{ cursor: 'pointer', margin: 'auto' }}
            >
                {docTitle}
            </Text>
          </Tooltip>
          
          {/* Get the display name from the ownerID */}
          <Text size="md" style = {{margin: 'auto'}}>Created by: {displayName}</Text>
          <Text size="sm" c="dimmed" style = {{margin: 'auto'}}>Last Edited: {millisecondsToFormattedDateString(last_edit_time)}</Text>
          <Text size="sm" c="dimmed" style = {{margin: 'auto'}}>Created On: {millisecondsToFormattedDateString(last_edit_time)}</Text>
        </Stack>
      </Card>}
    </>
  );
};