import React, { useState } from "react";
import { TextInput, PasswordInput } from "@mantine/core";
import { IconEyeCheck, IconEyeOff } from "@tabler/icons-react";

interface AuthInputProps {
  type: "text" | "password";
  label: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isShaking: boolean;
}

export function AuthInput({
  type,
  label,
  placeholder,
  value,
  onChange,
  isShaking,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const commonProps = {
    radius: "xl",
    label,
    placeholder,
    value,
    onChange,
    classNames: {
      input: `${isShaking ? "shake-input" : ""} focus-grow`,
    },
    styles: {
      label: {
        animation: "none",
      },
    },
  };

  if (type === "password") {
    return (
      <PasswordInput
        {...commonProps}
        visible={showPassword}
        onVisibilityChange={setShowPassword}
        classNames={{
          ...commonProps.classNames,
          innerInput: `${isShaking ? "shake-input" : ""}`,
          visibilityToggle: `${isShaking ? "shake-input" : ""}`,
        }}
        visibilityToggleIcon={({ reveal }) =>
          reveal ? <IconEyeOff size="1rem" /> : <IconEyeCheck size="1rem" />
        }
      />
    );
  }

  return <TextInput {...commonProps} />;
}
