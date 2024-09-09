import React from 'react';
import '@mantine/core/styles.css';
import './global.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';

export const metadata = {
    title: 'Tune Tracer',
    description: 'A rad online, collaborative sheet music editor'
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <ColorSchemeScript />
            </head>
            <body>
                <MantineProvider>{children}</MantineProvider>
            </body>
        </html>
    );
}