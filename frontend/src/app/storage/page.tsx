"use client";

import React, { useState } from "react";
import {
  AppShell,
  Container,
  Text,
  Button,
  Grid,
  Image,
  Title,
  Center,
  Group,
  Space,
  TextInput,
  Skeleton,
  Code,
  rem,
} from "@mantine/core";
import FiltersNavbar from "./FiltersNavbar";
import SearchBar from "./SearchBar";

export default function storage() {
  return (
    <AppShell padding="md" header={{ height: 60 }}>
      <AppShell.Header
        style={{
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Group justify="space-between" px="lg">
          {/* Replace with official logo */}
          <Text>Tune Tracer</Text>
          <SearchBar />
          <Button component="a" href="/login">
            Profile
          </Button>
        </Group>
      </AppShell.Header>

      <FiltersNavbar />

      {/* Placeholder  */}
      <AppShell.Main>
        {/* Hero Section */}
        <Container
          fluid
          style={{
            height: "70vh",
            weight: "100vw",
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            background:
              "linear-gradient(180deg, rgba(154,215,255,1) 0%, rgba(0,105,182,1) 100%)",
          }}
        ></Container>
        <Space h="xl"></Space>

        {/* Blurb */}
        <Container size="xl"></Container>
      </AppShell.Main>
    </AppShell>
  );
}
