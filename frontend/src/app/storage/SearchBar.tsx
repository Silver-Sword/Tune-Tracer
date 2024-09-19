import React, { useState } from "react";
import { AppShell, Container, rem, Text, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

const searchIcon = <IconSearch style={{ width: rem(16), height: rem(16) }} />;

const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event) => {
    const value = event.currentTarget.value;
    setSearchTerm(value);
    console.log(`Searching for: ${value}`);
    // More search logic here
  };

  return (
    <TextInput
      variant="filled"
      size="sm"
      radius="xl"
      placeholder="Search compositions"
      leftSectionPointerEvents="none"
      leftSection={searchIcon}
      onChange={handleSearch}
    />
  );
};

export default SearchBar;
