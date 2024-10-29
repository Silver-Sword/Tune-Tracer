import React from 'react';
import { TextInput, PasswordInput } from '@mantine/core';
import { shakeAnimation } from '../styles/auth-styles';

interface AuthInputProps {
  type: 'text' | 'password';
  label: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isShaking: boolean;
}

export function AuthInput({ type, label, placeholder, value, onChange, isShaking }: AuthInputProps) {
  const commonProps = {
    radius: 'xl',
    label,
    placeholder,
    value,
    onChange,
    classNames: {
      input: `${isShaking ? 'shake-input' : ''} focus-grow`,
    },
    styles: {
      label: {
        animation: 'none',
      },
    },
  };

  return type === 'password' ? (
    <PasswordInput
      {...commonProps}
      classNames={{
        ...commonProps.classNames,
        innerInput: `${isShaking ? 'shake-input' : ''}`,
        visibilityToggle: `${isShaking ? 'shake-input' : ''}`,
      }}
    />
  ) : (
    <TextInput {...commonProps} />
  );
}