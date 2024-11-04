import React, { useState } from "react";
import { Button, Modal, Text, Stack, Group } from "@mantine/core";

export const KeybindModal: React.FC = () => {
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);

  // Function to open the help modal
  const openHelpModal = () => setHelpModalOpen(true);

  // Function to close the help modal
  const closeHelpModal = () => setHelpModalOpen(false);

  return (
    <>
      {/* Help Button */}
      <Button onClick={openHelpModal} variant="filled">
        Keyboard Shortcuts
      </Button>

      {/* Modal */}
      <Modal
        opened={isHelpModalOpen}
        onClose={closeHelpModal}
        title="Keyboard Shortcuts"
        centered
      >
        <Stack gap="md">
          <Text>
            Use the following keyboard shortcuts to interact with the music composition tool:
          </Text>
          
          <Group gap="xs">
            <Text>
              <b>Note Keys:</b> Press any note key to add the corresponding note (e.g., "A" for A, "B" for B).
            </Text>
            <Text>
              <b>Pitch Shift:</b> Press <b>W</b> to pitch shift up and <b>S</b> to pitch shift down.
            </Text>
            <Text>
              <b>Delete:</b> Press <b>Backspace</b> to delete the last note added.
            </Text>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

