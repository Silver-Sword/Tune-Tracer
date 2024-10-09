'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Score } from './Score';
import { Button } from '@mantine/core';

const DEFAULT_RENDERER_WIDTH = 1000;
const DEFAULT_RENDERER_HEIGHT = 2000;

export default function Editor() {
    const notationRef = useRef<HTMLDivElement>(null);
    const score = useRef<Score | null>(null);

    // State for each input field
    
    
    const [addKeys, setAddKeys] = useState('');
    const [addNoteId, setAddNoteId] = useState('auto');
    const [addNoteMeasureIndex, setAddNoteMeasureIndex] = useState<number>(0);

    
    const [duration, setDuration] = useState('');
    const [durationMeasureIndex, setDurationNoteMeasureIndex] = useState<number>(0);
    const [durationNoteId, setDurationNoteId] = useState('auto');
    
    const [removeKeys, setRemoveKeys] = useState('');
    const [removeNoteId, setRemoveNoteId] = useState('auto');
    const [removeNoteMeasureIndex, setRemoveNoteMeasureIndex] = useState<number>(0);
    
    const [firstNoteId, setFirstNoteId] = useState('auto');
    const [firstMeasureIndex, setFirstMeasureIndex] = useState<number>(0);


    // Handlers for input changes
    const handleAddKeysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAddKeys(event.target.value);
    };
    const handleAddNoteIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAddNoteId(event.target.value);
    };
    const handleAddNoteMeasureIndexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        // Ensure that measureIndex is an integer or empty
        if (/^[0-9]+$/.test(value)) {
            setAddNoteMeasureIndex(parseInt(value, 10));
        }
        else {
            setAddNoteMeasureIndex(0);
        }
    };

    const handleRemoveKeysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRemoveKeys(event.target.value);
    };
    const handleRemoveNoteIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRemoveNoteId(event.target.value);
    };
    const handleRemoveNoteMeasureIndexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        // Ensure that measureIndex is an integer or empty
        if (/^[0-9]+$/.test(value)) {
            setRemoveNoteMeasureIndex(parseInt(value, 10));
        }
        else {
            setRemoveNoteMeasureIndex(0);
        }
    };

    const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDuration(event.target.value);
    };

    const handleDurationMeasureIndexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        // Ensure that measureIndex is an integer or empty
        if (/^[0-9]+$/.test(value)) {
            setDurationNoteMeasureIndex(parseInt(value, 10));
        }
        else {
            setDurationNoteMeasureIndex(0);
        }
    };    

    const handleDurationNoteIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDurationNoteId(event.target.value);
    };

    // Adding a Tie
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
                /*measure index*/ addNoteMeasureIndex,
                /*keys*/addKeys.split(','),
                /*noteId*/ addNoteId
            );
        }
    };

    const removeNote = () => {
        if (score.current) {
            score.current.removeNoteInMeasure(
                /*measure index*/ removeNoteMeasureIndex,
                /*keys*/removeKeys.split(','),
                /*noteId*/ removeNoteId
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
                /*measure index*/ durationMeasureIndex,
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
                    notationRef.current,
                    DEFAULT_RENDERER_HEIGHT,
                    DEFAULT_RENDERER_WIDTH
                );
            }
        };
        if (score.current === null) {
            clearSVG();
            renderNotation();
        }
    }, []);

    return (
        <div>
            <h1> Tune Tracer Composition Tool Demo</h1>
            <Button component='a' href='/composition_tool'>Go to Official Composition Tool</Button>
            <h2>Adding a Note</h2>
            <div>
                <label htmlFor="keys">Insert keys (comma-separated):</label>
                <input
                    type="text"
                    id="keys"
                    value={addKeys}
                    onChange={handleAddKeysChange}
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
            <div>
                <label htmlFor="measureIndex">Insert measure index:</label>
                <input
                    type="text"
                    id="measureIndex"
                    value={addNoteMeasureIndex.toString()}
                    onChange={handleAddNoteMeasureIndexChange}
                />
            </div>
            <button onClick={addNote}>Add note!</button>
            <h2>Removing Keys</h2>
            <div>
                <label htmlFor="keys">Insert keys (comma-separated):</label>
                <input
                    type="text"
                    id="keys"
                    value={removeKeys}
                    onChange={handleRemoveKeysChange}
                />
            </div>
            <div>
                <label htmlFor="removeNoteId">Insert note id:</label>
                <input
                    type="text"
                    id="removeNoteId"
                    value={removeNoteId}
                    onChange={handleRemoveNoteIdChange}
                />
            </div>
            <div>
                <label htmlFor="measureIndex">Insert measure index:</label>
                <input
                    type="text"
                    id="measureIndex"
                    value={removeNoteMeasureIndex.toString()}
                    onChange={handleRemoveNoteMeasureIndexChange}
                />
            </div>
            <button onClick={removeNote}>Remove key/note!</button>
            <h2>Changing Duration</h2>
            <div>
                <p>If you want to add a dot to a note, append a 'd' to the duration below, or 'dd' for two dots. 
                    NOTE: If you are adding a dot, the duration HAS to be the same as the duration of the note at the specified note ID, 
                    or else it will be invalid. For example, if you want to add a dot to a quarter note, you specify duration: 'qd', but '8d' will break vexflow</p>
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
                    value={durationMeasureIndex.toString()}
                    onChange={handleDurationMeasureIndexChange}
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
