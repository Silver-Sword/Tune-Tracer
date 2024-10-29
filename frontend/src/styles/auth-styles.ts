import { keyframes } from '@emotion/react';

export const shakeAnimation = keyframes({
  '0%, 100%': { transform: 'translateX(0)' },
  '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
  '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
});

export const authStyles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formBox: {
    width: '100%',
    maxWidth: '450px',
    minHeight: '550px',
    backgroundColor: 'white',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  titleBox: {
    background: '#228be6',
    padding: '3rem 2rem',
    marginBottom: '2rem',
  },
  formContainer: {
    padding: '0 2rem 2rem',
  },
};