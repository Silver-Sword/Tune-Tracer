'use client' // IMPORTANT as Vexflow only renders in the DOM

import React, { useEffect, useRef, useState } from 'react';
import { Score } from '../edit/Score';

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
        <div>
            {/* Button to replace a rest with a quarter note the button would call a function that boston made*/}
            <div ref={notationRef}></div>
            
        </div>
    );
};
