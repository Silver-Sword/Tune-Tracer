import React from "react";
import { Avatar, MantineTheme, Tooltip } from "@mantine/core";

interface OnlineUserIconProps {
  displayText: string;
  color: string;
  size?: number;
  tooltipText?: string;
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
  displayText,
  color,
  size = 40,
  tooltipText=undefined,
}: OnlineUserIconProps) {
  const avatarComponent = (
    <Avatar
      size={size}
      radius="xl"
      styles={(theme: MantineTheme) => ({
        root: {
          backgroundColor: color,
          color: isLightColor(color) ? theme.colors.dark[9] : theme.white,
          border: '3px solid #222222',
        },
      })}
    >
      {displayText}
    </Avatar>
  );

  return tooltipText ? (
    <Tooltip label={tooltipText} withArrow>
      {avatarComponent}
    </Tooltip>
  ) : (
    avatarComponent
  );
}
