import {
    Container,
    Text,
    Button,
    Group,
    Space,
    Stack,
    SimpleGrid,
    Grid,
    Flex,
    Input,
    TextInput,
    Paper,
    Avatar,
    Divider,
    ScrollArea,
    Tooltip,
    Tabs,
    SegmentedControl,
    ActionIcon,
    Modal,
    rem,
    Center,
    CopyButton,
    Select,
} from "@mantine/core";
import {
    IconCopy,
    IconCheck,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import React from "react";
import { useState } from "react";
import { getUserID, getDocumentID } from "../cookie";

// CollaboratorCard component used in SharingModal to show who has access 
export const CollaboratorCard: React.FC<{
    name: string;
    email: string;
    role: 'Viewer' | 'Commenter' | 'Editor';
    onRoleChange: (newRole: 'Viewer' | 'Commenter' | 'Editor') => void;
    onRemove: () => void;
}> = ({ name, email, role, onRoleChange, onRemove }) => {
    const [currentRole, setCurrentRole] = useState<'Viewer' | 'Commenter' | 'Editor' | 'Remove access'>(role);

    const handleRoleChange = (newRole: 'Viewer' | 'Commenter' | 'Editor' | 'Remove access') => {
        if (newRole === 'Remove access') {
            onRemove(); // Call the remove function if "Remove access" is selected
        } else {
            setCurrentRole(newRole);
            onRoleChange(newRole);
        }
    };

    return (
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
            {/* Avatar and Collaborator Info */}
            <Group>
                <div>
                    <Text size="sm">{name}</Text>
                    <Text size="xs" c="dimmed">{email}</Text>
                </div>
            </Group>

            {/* Role Selector */}
            <Select
                checkIconPosition="right"
                value={currentRole}
                onChange={(newRole) => handleRoleChange(newRole as 'Viewer' | 'Commenter' | 'Editor' | 'Remove access')}
                data={[
                    { value: 'Viewer', label: 'Viewer' },
                    { value: 'Commenter', label: 'Commenter' },
                    { value: 'Editor', label: 'Editor' },
                    { value: 'Remove access', label: 'Remove access' }  // Red to differentiate remove
                ]}
                style={{ width: 150 }}
            />
        </Group>
    );
};

// Define types for the collaborator
interface Collaborator {
    name: string;
    email: string;
    role: 'Viewer' | 'Commenter' | 'Editor';
}

// Sharing Modal Component
export const SharingModal: React.FC = () => {
    // Sharing logic here
    const [openShare, { open, close }] = useDisclosure(false);

    // SAMPLE
    const [collaborators, setCollaborators] = useState<Collaborator[]>([
        { name: 'Jose Cuyugan', email: 'werhhh@gmail.com', role: 'Editor' },
        { name: 'Chris Gittings', email: 'asdfadf.cg@gmail.com', role: 'Viewer' },
        { name: 'Jordy Valois', email: 'dddddd@gmail.com', role: 'Commenter' },
        { name: 'Sophia DeAngelo', email: 'ssss@hotmail.com', role: 'Editor' },
    ]);

    const handleRoleChange = (newRole: 'Viewer' | 'Commenter' | 'Editor', index: number) => {
        const updatedCollaborators = [...collaborators];
        updatedCollaborators[index].role = newRole;
        setCollaborators(updatedCollaborators);
    };

    // Function to remove a collaborator
    const handleRemove = (index: number) => {
        const updatedCollaborators = collaborators.filter((_, i) => i !== index);
        setCollaborators(updatedCollaborators);
    };

    const [shareCode, setShareCode] = useState<number>(0);
    const [shareCodeIsLoading, setShareCodeIsLoading] = useState<string>("Generate Code");
    const [accessLevel, setAccessLevel] = useState<'Viewer' | 'Commenter' | 'Editor'>('Viewer');

    const handleCreateCode = async () => {
        const CREATE_CODE_URL = 'https://us-central1-l17-tune-tracer.cloudfunctions.net/createShareCode';
        setShareCodeIsLoading("Loading...");
        var sharing = 1;
        switch (accessLevel) {     
            case 'Viewer':
                sharing = 2;
                break;
            case 'Commenter':
                sharing = 3;
                break;
            case 'Editor':
                sharing = 4;
                break;
            default:
                return;
        }
        
        const param = {
            documentId: getDocumentID(),
            sharing: sharing,
            writerId: getUserID()
        }
        console.log(param);
        const PUT_OPTION = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(param)
        }

        await fetch(CREATE_CODE_URL, PUT_OPTION).then((res) => {
            res.json().then((value) => {
                if (res.status === 200) {
                    setShareCode(value['data']);
                }
                else if (res.status === 500) {
                    console.log(`Error: ${value['message']}`);
                    throw new Error(value['message']);
                }
            });
        }).catch((error) => {
            console.error('Error:', error);
        });
        setShareCodeIsLoading("Generate Code");
    };

    return (
        <>
            <Modal
                opened={openShare}
                onClose={close}
                title="Share: [Document Name]"
                centered
                size="lg"
            >
                {/* Modal content */}
                <TextInput placeholder="Add collaborators by email here"></TextInput>
                <Space h="sm" />
                <Text>Collaborators</Text>
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

                <Divider size="sm" my="sm"></Divider>

                <Text>Code Access</Text>
                <Space h="sm"></Space>
                <Group justify="space-between">
                    <Container>
                        {/* Code gets rendered here, it is limited to 6 numbers */}
                        <Text ta="center" c="blue" fw={700} style={{ letterSpacing: '0.5em' }} >
                            {shareCode}
                        </Text>
                    </Container>

                    <Group>
                        {/* Uncomment block if multiple codes are allowed to exist based on access level */}
                        <Select
                            checkIconPosition="right"
                            value={accessLevel}
                            placeholder="Access Level"
                            onChange={(value) => setAccessLevel(value as 'Viewer' | 'Commenter' | 'Editor')}
                            data={[
                                { value: 'Viewer', label: 'Viewer' },
                                { value: 'Commenter', label: 'Commenter' },
                                { value: 'Editor', label: 'Editor' },
                            ]}
                            style={{ width: 150 }}
                        />

                        <Button onClick={handleCreateCode}>{shareCodeIsLoading}</Button>
                    </Group>
                </Group>

                <Divider size="sm" my="sm"></Divider>

                <Text>Link Access</Text>
                <Space h="sm"></Space>
                {/* Replace value with the document link */}
                <Center>
                    <CopyButton value="null" timeout={10000}>
                        {({ copied, copy }) => (
                            <Button
                                rightSection={copied ? <IconCheck /> : <IconCopy />}
                                variant={copied ? "filled" : "outline"}
                                onClick={copy}
                            >
                                {copied ? "Copied" : "Copy Link"}
                            </Button>
                        )}
                    </CopyButton>
                </Center>
            </Modal>
            <Button onClick={open}>Share</Button>
            {/* Profile Icon */}
        </>
    );
};