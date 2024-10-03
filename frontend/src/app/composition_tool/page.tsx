'use client' // IMPORTANT as Vexflow only renders in the DOM

import React, { useEffect, useRef, useState } from 'react';
import { Score } from '../edit/Score';
import {
    AppShell, 
    Container, 
    Text,
    Button,
    Group,
    Space,
    Stack,
    SimpleGrid,
    Grid,
} from "@mantine/core";

const DEFAULT_RENDERER_WIDTH = 1000;
const DEFAULT_RENDERER_HEIGHT = 2000;

export default function CompositionTool() {
    const notationRef = useRef<HTMLDivElement>(null);
    const score = useRef<Score | null>(null);

    useEffect(() => {
        const clearSVG = () => {
            if (notationRef.current) {
                notationRef.current.innerHTML = '';
            }
        };

        const renderNotation = () => {
            if (notationRef.current) {
                score.current = new Score(
                    notationRef.current,
                    DEFAULT_RENDERER_HEIGHT,
                    DEFAULT_RENDERER_WIDTH
                );
            }
        };

        clearSVG();
        renderNotation();
    }, []);

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 250,
                breakpoint: "sm",
            }}
            padding="md"
        >
            <AppShell.Main>
                <AppShell.Header
                    style={{
                        justifyContent: "center",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Group justify="space-between" px="lg">
                        <Text>Tune Tracer</Text>

                        <Button component="a">Share</Button>
                    </Group>
                    
                    
                </AppShell.Header>
                    
                    {/* Somehow adding the NavBar removes the score and its container */}
                {/* <AppShell.Navbar>

                </AppShell.Navbar> */}

                
                    {/* get rid of the background later, use it for formatting */}
                <Container
                    fluid
                    size="responsive"
                    style={{
                        justifyContent: "center",
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "center",
                        background:
                        "linear-gradient(180deg, rgba(154,215,255,1) 0%, rgba(0,105,182,1) 100%)",
                    }}
                >

                    <div>
                        <div ref={notationRef}></div>
                    </div>
                </Container>


                    
            </AppShell.Main>
        </AppShell>
    );
};
