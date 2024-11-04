"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  Text,
  Button,
  Group,
  Space,
  ScrollArea,
  Divider,
  Select,
  Container,
  CopyButton,
  Center,
  Grid,
  Title,
  LoadingOverlay,
} from "@mantine/core";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { CollaboratorCard } from "./CollaboratorCard";
import { Collaborator } from "./sharing_types";
import { createShareCode, updateDocumentShareStyle, upsertCollaborator, removeCollaborator, getUserDetails } from "./sharing_api";
import { ShareStyle } from "../../lib/src/documentProperties";
import { DocumentMetadata } from "../../lib/src/documentProperties";
import { useSearchParams } from "next/navigation";

interface SharingModalProps {
  documentTitle: string;
  metadata: DocumentMetadata | undefined;
}

export const SharingModal: React.FC<SharingModalProps> = ({
  documentTitle = "Untitled Document",
  metadata = undefined,
}) => {
  const [openShare, { open, close }] = useDisclosure(false);
  const [currentTitle, setCurrentTitle] = useState(documentTitle);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [knownCollaborators, setKnownCollaborators] = useState<Record<string, Collaborator>>({});

  const [shareCode, setShareCode] = useState<string>("------");
  const [shareCodeIsLoading, setShareCodeIsLoading] = useState<string>("Generate Code");
  const [documentId, setDocumentId] = useState<string>("");
  const [accessType, setAccessType] = useState<"restricted" | "anyone">("restricted");
  const [accessLevel, setAccessLevel] = useState<"Viewer" | "Editor">("Viewer");
  const searchParams = useSearchParams();

  // New state for email input and loading state
  const [email, setEmail] = useState("");
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false);
  const [addCollaboratorMessage, setAddCollaboratorMessage] = useState("");

  useEffect(() => {
    setCurrentTitle(documentTitle);
  }, [documentTitle]);

  useEffect(() => {
    setDocumentId(searchParams.get('id') || 'null');
  }, []);

  const fetchUserDetails = async (userId: string, role: string) => {
    try {
      const userDetails = await getUserDetails(userId);
      if(!userDetails) {
        console.error(`Failed to fetch user details for ${userId}`);
        return;
      }
      const newCollaborator: Collaborator = {
        name: userDetails.name,
        email: userDetails.email,
        role: role as "Viewer" | "Editor",
      };
      setKnownCollaborators(prev => ({ ...prev, [userId]: newCollaborator }));
      setCollaborators(prevCollaborators => {
        if (!prevCollaborators.some(collab => collab.email === newCollaborator.email)) {
          return [...prevCollaborators, newCollaborator];
        }
        return prevCollaborators;
      });
    } catch (error) {
      console.error(`Failed to fetch user details for ${userId}:`, error);
    }
  };

  useEffect(() => {
    if(metadata === undefined) {
      console.warn("Metadata is undefined in sharing modal");
      return;
    }

    const shareStyle = metadata.share_link_style;
    setAccessLevel(shareStyle === ShareStyle.WRITE ? "Editor" : "Viewer");
    setAccessType(shareStyle === ShareStyle.NONE ? "restricted" : "anyone");

    // handle collaborators changes
    if(metadata?.share_list !== undefined) {
      const newCollaborators: Collaborator[] = [];
      for (const [sharedUserId, shareValue] of Object.entries(metadata.share_list)) {
        const sharedUserRole = shareValue === ShareStyle.WRITE ? "Editor" : "Viewer";
        if (knownCollaborators[sharedUserId]) {
          const existingCollaborator = knownCollaborators[sharedUserId];
          if (!newCollaborators.some(collab => collab.email === existingCollaborator.email)) {
            newCollaborators.push({...existingCollaborator});
          }
        } else {
          fetchUserDetails(sharedUserId, sharedUserRole);
        }
      }
      setCollaborators(newCollaborators);
    } else {
      console.warn("Metadata share_list is undefined in sharing modal");
    }
  }, [metadata]);

  const handleRoleChange = (newRole: "Viewer" | "Editor", index: number) => {
    const updatedCollaborators = [...collaborators];
    updatedCollaborators[index].role = newRole;
    setCollaborators(updatedCollaborators);
  };

  const handleRemove = (index: number) => {
    const updatedCollaborators = collaborators.filter((_, i) => i !== index);
    setCollaborators(updatedCollaborators);
  };

  const handleCreateCode = async () => {
    setShareCodeIsLoading("Loading...");
    try {
      const response = await createShareCode(accessLevel, documentId);
      if (response.status === 200) {
        setShareCode(response.data as string);
      } else {
        console.log(`Error: ${response.message}`);
        setShareCode("ERROR");
      }
    } catch (error) {
      console.error("Error creating share code:", error);
      setShareCode("ERROR");
    }
    setShareCodeIsLoading("Regenerate Code");
  };

  // New function to handle adding a collaborator
  const handleAddCollaborator = async () => {
    if (!email) return;

    setIsAddingCollaborator(true);
    setAddCollaboratorMessage("");

    try {
      const response = await upsertCollaborator(email, documentId, "Viewer");
      if (response.status === 200) {
        setAddCollaboratorMessage("Collaborator added successfully!");
        setEmail("");
      } else {
        setAddCollaboratorMessage(response.message || "Failed to add collaborator.");
      }
    } catch (error) {
      console.error("Error adding collaborator:", error);
      setAddCollaboratorMessage("An error occurred while adding the collaborator.");
    } finally {
      setIsAddingCollaborator(false);
    }
  };

  return (
    <Group>
      <Modal
        opened={openShare}
        onClose={close}
        title={<Title order={2}>Share Composition: {currentTitle}</Title>}
        centered
        size="lg"
      >
        <LoadingOverlay visible={isAddingCollaborator} />
        <TextInput
          placeholder="Add collaborators by email here"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleAddCollaborator();
            }
          }}
          onBlur={handleAddCollaborator}
        />
        {addCollaboratorMessage && (
          <Text color={addCollaboratorMessage.includes("successfully") ? "green" : "red"} size="sm" mt="xs">
            {addCollaboratorMessage}
          </Text>
        )}
        <Space h="sm" />
        <Title order={4}>Collaborators</Title>
        <ScrollArea mah={250}>
          {collaborators.map((collab, index) => (
            <CollaboratorCard
              key={index}
              name={collab.name}
              email={collab.email}
              role={collab.role}
              onRoleChange={(newRole) => handleRoleChange(newRole, index)}
              onRemove={() => handleRemove(index)}
            />
          ))}
        </ScrollArea>

        <Divider size="sm" my="sm" />

        <Title order={4}>General Access</Title>
        <Space h="sm" />
        <Group
          justify="space-between"
          style={{
            padding: '15px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            marginBottom: '10px',
            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Select
            label="Access Type"
            c="dimmed"
            value={accessType}
            onChange={(value) => {
                const newAccessType = value as "restricted" | "anyone";
                setAccessType(newAccessType);
                updateDocumentShareStyle(newAccessType, accessLevel, documentId);
              }
            }
            data={[
              { value: "restricted", label: "Restricted" },
              { value: "anyone", label: "Anyone with link/code" },
            ]}
            style={{ width: 200 }}
          />
          {accessType === "anyone" && (
            <Group align="right">
              <Select
                label="Role"
                c="dimmed"
                value={accessLevel}
                onChange={(value) => {
                    const newAccessLevel = value as "Viewer" | "Editor";
                    setAccessLevel(newAccessLevel);
                    updateDocumentShareStyle(accessType, newAccessLevel, documentId);
                  }
                }
                data={[
                  { value: "Viewer", label: "Viewer" },
                  { value: "Editor", label: "Editor" },
                ]}
                style={{ width: 150, align: "right" }}
              />
            </Group>
          )}
        </Group>

        {accessType === "anyone" && (
          <>
            <Space h="md" />
            <Grid gutter="md">
              <Grid.Col span={5}>
                <Text fw={500} mb="xs" ta="center">
                  Link Access
                </Text>
                <Center>
                  <CopyButton value={location.href} timeout={10000}>
                    {({ copied, copy }) => (
                      <Button
                        rightSection={
                          copied ? (
                            <IconCheck size={16} />
                          ) : (
                            <IconCopy size={16} />
                          )
                        }
                        variant={copied ? "filled" : "outline"}
                        onClick={copy}
                      >
                        {copied ? "Copied" : "Copy Link"}
                      </Button>
                    )}
                  </CopyButton>
                </Center>
              </Grid.Col>
              <Grid.Col span={6} style={{ borderLeft: "1px solid #e0e0e0" }}>
                <Text fw={500} mb="xs" ta="center">
                  Code Access
                </Text>
                <Group >
                  <Container>
                    <Text
                      ta="left"
                      c="blue"
                      fw={700}
                      style={{ letterSpacing: "0.25em" }}
                    >
                      {shareCode}
                    </Text>
                  </Container>
                  <CopyButton value={shareCode} timeout={10000}>
                    {({ copied, copy }) => (
                      <Button
                        rightSection={
                          copied ? (
                            <IconCheck size={16} />
                          ) : (
                            <IconCopy size={16} />
                          )
                        }
                        variant={copied ? "filled" : "outline"}
                        onClick={copy}
                        disabled={shareCode === "ERROR" || shareCode === "------"}
                      >
                        {copied ? "Copied" : "Copy Code"}
                      </Button>
                    )}
                  </CopyButton>
                  
                  </Group>
                
                  <Space h="md" />
                  <Center>
                    <Button onClick={handleCreateCode}>
                      {shareCodeIsLoading}
                    </Button>
                    
                  </Center>
              </Grid.Col>
            </Grid>
          </>
        )}
      </Modal>
      <Button onClick={open}>Share</Button>
    </Group>
  );
};
