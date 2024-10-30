import React, { useState } from "react";
import { TextInput, PasswordInput, Tooltip, Text, Box, Center } from "@mantine/core";
import { IconEyeCheck, IconEyeOff } from "@tabler/icons-react";

interface AuthInputProps {
  type: "text" | "password";
  label: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isShaking: boolean;
  isSignUp?: boolean;
}

const passwordRequirements = [
  { re: /.{8,}/, label: "Minimum 8 characters" },
  { re: /[0-9]/, label: "Includes number" },
  { re: /[a-z]/, label: "Includes lowercase letter" },
  { re: /[A-Z]/, label: "Includes uppercase letter" },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Includes special symbol" },
];

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
    return (
      <Text
        color={meets ? 'teal' : 'red'}
        style={{ display: 'flex', alignItems: 'center' }}
        mt={7}
        size="sm"
      >
        {meets ? '✓' : '✗'} <span style={{ marginLeft: '5px', color: '#333' }}>{label}</span>
      </Text>
    );
  }

  function PasswordRequirements({ password }: { password: string }) {
    const requirements = passwordRequirements.map((requirement, index) => (
      <PasswordRequirement
        key={index}
        label={requirement.label}
        meets={requirement.re.test(password)}
      />
    ));
  
    return (
        <Box>
          <Box
            style={{
              background: '#228be6',
              padding: '10px',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
            }}
          >
            <Center>
              <Text size="md" style={{ color: 'white', fontWeight: 700 }}>
                Password Requirements
              </Text>
            </Center>
          </Box>
          <Box style={{ padding: '15px', paddingTop: '5px' }}>
            {requirements}
          </Box>
        </Box>
      );
  }
  

export function AuthInput({
  type,
  label,
  placeholder,
  value,
  onChange,
  isShaking,
  isSignUp,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const commonProps = {
    radius: "xl",
    maxLength: 100,
    label,
    placeholder,
    value,
    onChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
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
    const passwordInput = (
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

    if (isSignUp) {
            return (
                <Tooltip
                  opened={focused}
                  position="right"
                  offset={10}
                  withArrow
                  arrowSize={10}
                  styles={{
                    tooltip: {
                      backgroundColor: 'white',
                      color: 'black',
                      border: '1px solid #e0e0e0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      padding: 0,
                      width: '300px',
                    },
                    arrow: {
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                    },
                  }}
                  label={<PasswordRequirements password={value} />}
                >
                  {passwordInput}
                </Tooltip>
          );
    }

    return passwordInput;
  }

  return <TextInput {...commonProps} />;
}
