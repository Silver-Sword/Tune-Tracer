import React, { useState } from "react";
import { Divider, Modal, Text, Stack, Group, Kbd, Title, Tooltip, ActionIcon } from "@mantine/core";
import { IconKeyboard } from "@tabler/icons-react";

export const KeybindModal: React.FC = () => {
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);

  // Function to open the help modal
  const openHelpModal = () => setHelpModalOpen(true);

  // Function to close the help modal
  const closeHelpModal = () => setHelpModalOpen(false);

  return (
    <>
      {/* Help Button */}
      <Tooltip label={`Keyboard Shortcuts`} withArrow>
        <ActionIcon
          className="keybinds"
          radius={"xl"}
          size={"lg"}
          onClick={openHelpModal}
        >
          <IconKeyboard />
        </ActionIcon>
      </Tooltip>

      {/* Modal */}
      <Modal
        opened={isHelpModalOpen}
        onClose={closeHelpModal}
        title={<Title order={2}>Keyboard Shortcuts</Title>}
        centered
      >
        <Stack gap="md">
          <Text>
            Use the following keyboard shortcuts to interact with the music composition tool when a notehead is selected:
          </Text>
          
          <Divider />

          <Group gap="xs">
            <Text>
              <b>Note Keys:</b>
              <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                <li><Kbd>A</Kbd> - Adds an A note</li>
                <li><Kbd>B</Kbd> - Adds a B note</li>
                <li><Kbd>C</Kbd> - Adds a C note</li>
                <li><Kbd>D</Kbd> - Adds a D note</li>
                <li><Kbd>E</Kbd> - Adds an E note</li>
                <li><Kbd>F</Kbd> - Adds an F note</li>
                <li><Kbd>G</Kbd> - Adds a G note</li>
              </ul>
            </Text>

            <Text>
              <b>Pitch Shift:</b> Press <Kbd>W</Kbd> to pitch shift up and <Kbd>S</Kbd> to pitch shift down.
            </Text>
            <Text>
              <b>Delete</b>: Press <Kbd>Backspace</Kbd> to delete the last note added.
            </Text>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

