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
} from "@mantine/core";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { CollaboratorCard } from "./CollaboratorCard";
import { Collaborator } from "./sharing_types";
import { createShareCode } from "./sharing_api";
import { ShareStyle } from "../../lib/src/documentProperties";

interface SharingModalProps {
  documentTitle: string;
  shareStyle: ShareStyle;
}

export const SharingModal: React.FC<SharingModalProps> = ({
  documentTitle = "Untitled Document",
  shareStyle,
}) => {
  const [openShare, { open, close }] = useDisclosure(false);
  const [currentTitle, setCurrentTitle] = useState(documentTitle);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { name: "Jose Cuyugan", email: "werhhh@gmail.com", role: "Editor" },
    { name: "Chris Gittings", email: "asdfadf.cg@gmail.com", role: "Viewer" },
    { name: "Jordy Valois", email: "dddddd@gmail.com", role: "Viewer" },
    { name: "Sophia DeAngelo", email: "ssss@hotmail.com", role: "Editor" },
  ]);

  const [shareCode, setShareCode] = useState<string>("------");
  const [shareCodeIsLoading, setShareCodeIsLoading] =
    useState<string>("Generate Code");
  const [accessType, setAccessType] = useState<"restricted" | "anyone">(
    "restricted"
  );
  const [accessLevel, setAccessLevel] = useState<"Viewer" | "Editor">("Viewer");

  useEffect(() => {
    setCurrentTitle(documentTitle);
  }, [documentTitle]);

  useEffect(() => {
    if (
      shareStyle === ShareStyle.READ ||
      shareStyle === ShareStyle.COMMENT ||
      shareStyle === ShareStyle.WRITE
    ) {
      setAccessType("anyone");
    } else {
      setAccessType("restricted");
    }
  }, [shareStyle]);

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
      const response = await createShareCode(accessLevel);
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
    setShareCodeIsLoading("Generate Code");
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
        <TextInput placeholder="Add collaborators by email here" />
        <Space h="sm" />
        <Title order={4}>Collaborators</Title>
        <ScrollArea h={250}>
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
        <Group>
          <Select
            label="Access Type"
            value={accessType}
            onChange={(value) =>
              setAccessType(value as "restricted" | "anyone")
            }
            data={[
              { value: "restricted", label: "Restricted" },
              { value: "anyone", label: "Anyone with link/code" },
            ]}
            style={{ width: 200 }}
          />
          {accessType === "anyone" && (
            <Select
              label="Role"
              value={accessLevel}
              onChange={(value) => setAccessLevel(value as "Viewer" | "Editor")}
              data={[
                { value: "Viewer", label: "Viewer" },
                { value: "Editor", label: "Editor" },
              ]}
              style={{ width: 150, align: "right" }}
            />
          )}
        </Group>

        {accessType === "anyone" && (
          <>
            <Space h="md" />
            <Grid gutter="md">
              <Grid.Col span={6}>
                <Text fw={500} mb="xs" ta="center">
                  Link Access
                </Text>
                <Center>
                  <CopyButton value="null" timeout={10000}>
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
                <Group justify="space-between">
                  <Container>
                    <Text
                      ta="left"
                      c="blue"
                      fw={700}
                      style={{ letterSpacing: "0.5em" }}
                    >
                      {shareCode}
                    </Text>
                  </Container>
                  <Button onClick={handleCreateCode}>
                    {shareCodeIsLoading}
                  </Button>
                </Group>
              </Grid.Col>
            </Grid>
          </>
        )}
      </Modal>
      <Button onClick={open}>Share</Button>
    </Group>
  );
};
