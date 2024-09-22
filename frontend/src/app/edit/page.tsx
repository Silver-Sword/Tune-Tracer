'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Score } from './Score';

export default function Editor() {
    const notationRef = useRef<HTMLDivElement>(null);
    const score = useRef<Score | null>(null);

    // State for each input field
    const [keys, setKeys] = useState('');
    const [duration, setDuration] = useState('');
    const [measureIndex, setMeasureIndex] = useState<number>(0);
    const [addNoteId, setAddNoteId] = useState('auto');
    const [durationNoteId, setDurationNoteId] = useState('auto');
    const [firstNoteId, setFirstNoteId] = useState('auto');
    const [firstMeasureIndex, setFirstMeasureIndex] = useState<number>(0);


    // Handlers for input changes
    const handleKeysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setKeys(event.target.value);
    };

    const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDuration(event.target.value);
    };

    const handleMeasureIndexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        // Ensure that measureIndex is an integer or empty
        if (/^[0-9]+$/.test(value)) {
            setMeasureIndex(parseInt(value, 10));
        }
        else {
            setMeasureIndex(0);
        }
    };

    const handleAddNoteIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAddNoteId(event.target.value);
    };

    const handleDurationNoteIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDurationNoteId(event.target.value);
    };


    const handleFirstNoteIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFirstNoteId(event.target.value);
    };
    
    const handleFirstMeasureIndexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        // Ensure that measureIndex is an integer or empty
        if (/^[0-9]+$/.test(value)) {
            setFirstMeasureIndex(parseInt(value, 10));
        }
        else {
            setFirstMeasureIndex(0);
        }
    };

    const addNote = () => {
        if (score.current) {
            score.current.addNoteInMeasure(
                /*measure index*/ measureIndex,
                /*keys*/keys.split(','),
                /*noteId*/ addNoteId
            );
        }
    };

    const addMeasureToEnd = () => {
        if (score.current) {
            score.current.addMeasure();
        }
    };

    const modifyDuration = () => {
        if (score.current) {
            score.current.modifyDurationInMeasure(
                /*measure index*/ measureIndex,
                /*duration*/ duration,
                /*noteId*/ durationNoteId
            );
        }
    };

    const addTieBetweenNotes = () => {
        if (score.current) {
            score.current.addTieBetweenNotes(
                firstNoteId,
                firstMeasureIndex
            )
        }
    }

    useEffect(() => {
        const clearSVG = () => {
            if (notationRef.current) {
                notationRef.current.innerHTML = '';
            }
        };

        const renderNotation = () => {
            if (notationRef.current) {
                score.current = new Score(
                    notationRef.current
                );
            }
        };

        clearSVG();
        renderNotation();
    }, []);

    return (
        <div>
            <h1> Tune Tracer Composition Tool Demo</h1>
            <h2>Adding a Note</h2>
            <div>
                <label htmlFor="keys">Insert keys (comma-separated):</label>
                <input
                    type="text"
                    id="keys"
                    value={keys}
                    onChange={handleKeysChange}
                />
            </div>
            <div>
                <label htmlFor="addNoteId">Insert note id:</label>
                <input
                    type="text"
                    id="addNoteId"
                    value={addNoteId}
                    onChange={handleAddNoteIdChange}
                />
            </div>
            <button onClick={addNote}>Add note!</button>
            <h2>Changing Duration</h2>
            <div>
                <label htmlFor="duration">Insert duration:</label>
                <input
                    type="text"
                    id="duration"
                    value={duration}
                    onChange={handleDurationChange}
                />
            </div>
            <div>
                <label htmlFor="measureIndex">Insert measure index:</label>
                <input
                    type="text"
                    id="measureIndex"
                    value={measureIndex.toString()}
                    onChange={handleMeasureIndexChange}
                />
            </div>
            <div>
                <label htmlFor="durationNoteId">Insert note id:</label>
                <input
                    type="text"
                    id="durationNoteId"
                    value={durationNoteId}
                    onChange={handleDurationNoteIdChange}
                />
            </div>
            <button onClick={modifyDuration}>Change duration of specified element</button>
            <button onClick={addMeasureToEnd}>Add a measure to the end</button>
            <h2>Adding a Tie</h2>
            <div>
                <label htmlFor="noteId">Insert first note id:</label>
                <input
                    type="text"
                    id="firstNoteId"
                    value={firstNoteId}
                    onChange={handleFirstNoteIdChange}
                />
                  <label htmlFor="measureIndex">Insert first measure index:</label>
                <input
                    type="text"
                    id="firstMeasureIndex"
                    value={firstMeasureIndex.toString()}
                    onChange={handleFirstMeasureIndexChange}
                />
            </div>
            <button onClick={addTieBetweenNotes}>Add Tie between notes</button>
            <div ref={notationRef}></div>
        </div>
    );
};
