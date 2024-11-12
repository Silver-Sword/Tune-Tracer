import React from "react";
import { Avatar, MantineTheme, Tooltip } from "@mantine/core";

interface OnlineUserIconProps {
  user_id: string;
  display_name: string;
  color: string;
  size?: number;
}

// Function to determine if a color is light or dark
function isLightColor(color: string): boolean {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

export default function OnlineUserIcon({
  user_id,
  display_name,
  color,
  size = 40,
}: OnlineUserIconProps) {
  // Get the first character of the display name
  const initial = display_name.charAt(0).toUpperCase();

  return (
    <Tooltip 
      label={display_name}
      withArrow
    >
      <Avatar
        size={size}
        radius="xl"
        styles={(theme: MantineTheme) => ({
          root: {
            backgroundColor: color,
            color: isLightColor(color) ? theme.colors.dark[9] : theme.white,
            border: `2px solid "black"`,
          },
        })}
      >
        {initial}
      </Avatar>
    </Tooltip>
  );
}
