import { saveDocID } from "../cookie";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
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


// TODO: make the join w code button responsive if invalid code apart from no code is entered
export const CreateCard: React.FC<{userId: string}> = (userId) => {
  const [inviteCode, setInviteCode] = useState("");
  const [opened, { toggle }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const router = useRouter();

  const CREATE_DOCUMENT_URL = 'https://us-central1-l17-tune-tracer.cloudfunctions.net/createDocument';

  const handleCreateDocument = async () => {
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
      setLoading(true);
      await fetch(CREATE_DOCUMENT_URL, requestOptions)
        .then((res) => {
          if (res.status == 200)
          {
            let documentId;
            res.json().then((value) => {
              // document.metadata.document_id
              documentId = value['data'].metadata.document_id;
              saveDocID(documentId);
              console.log(`DocumentId: ${documentId}`);

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
    setJoinLoading(true);
    await fetch(USE_SHARE_CODE, PUT_OPTION).then((res) => {
      res.json().then((value) => {
        if (res.status == 200)
          {
            if (value['data'] == null)
            {
              throw new Error("Invalid invite code");
            }
            console.log("Successfully joined with invite code:", value['data']);
            console.log("Join with invite code:", inviteCode);
            router.push(`/composition_tool?id=${value['data']}`);
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
    setJoinLoading(false);
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
      className="create-card"
    >
      <Stack>
        {/* THE HREF IS TEMPORARY FOR DEMO */}
        {/* Probably needs a handleDocumentCreation to push a new document into the user that creates this */}
        <Button 
          fullWidth 
          onClick={handleCreateDocument}
          loading = {loading}>
          New Score
        </Button>

        <Text size="sm" color="dimmed" style={{ textAlign: 'center', fontWeight: 'bold' }}>
          or
        </Text>

        <TextInput placeholder="Enter invite code" value={inviteCode} onChange={handleInviteCodeChange} />

        <Button
          size="sm"
          color="green"
          onClick={handleJoinWithCode}
          disabled={!inviteCode.trim()} // Disable if the invite code is empty or contains only spaces
          loading={joinLoading}
        >
          Join with Code
        </Button>
      </Stack>
    </Card>
  );
};