import React, { useState } from 'react';
import { AppShell, Button, Group, Stack } from '@mantine/core';

// Your filter labels
const filterLabels = [
  { link: '', label: 'All' },
  { link: '', label: 'Shared with you' },
  { link: '', label: 'Favorites' },
  { link: '', label: 'Recents' },
  { link: '', label: 'A-Z' },
];

// Define a type for the filter labels
type FilterLabel = {
  link: string;
  label: string;
};

const FiltersNavbar: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('All'); // State to track the active filter

  // Function to handle filter changes
  const handleFilterClick = (label: string) => {
    setActiveFilter(label);
    console.log(`Filter selected: ${label}`); // Add logic here for rendering the correct workspaces
  };

  return (
    <AppShell.Navbar
      p="xl"
    >
      <Stack
        gap="xs">
        
        {filterLabels.map((filter: FilterLabel) => (
          <Button
            key={filter.label}
            variant={activeFilter === filter.label ? 'filled' : 'outline'}
            fullWidth
            onClick={() => handleFilterClick(filter.label)}
          >
            {filter.label}
          </Button>
        ))}
      </Stack>
    </AppShell.Navbar>
  );
};

export default FiltersNavbar;
