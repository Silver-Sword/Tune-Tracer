'use client'

import React, { useEffect, useRef, useState } from 'react';
import Vex, { Formatter } from 'vexflow';
import { Score } from './Score';

export default function Editor() {
    const notationRef = useRef<HTMLDivElement>(null);
    const score = useRef<Score | null>(null);

    // State for each input field
    const [keys, setKeys] = useState('');
    const [duration, setDuration] = useState('');
    const [measureIndex, setMeasureIndex] = useState<number>(0);
    const [noteId, setNoteId] = useState('auto');
    const [firstNoteId, setFirstNoteId] = useState('auto');
    const [firstMeasureIndex, setFirstMeasureIndex] = useState<number>(0);
    const [secondNoteId, setSecondNoteId] = useState('auto');
    const [secondMeasureIndex, setSecondMeasureIndex] = useState<number>(0);

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

    const handleNoteIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNoteId(event.target.value);
    };

    const handleFirstNoteIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFirstNoteId(event.target.value);
    };

    const handleSecondNoteIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSecondNoteId(event.target.value);
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

    const handleSecondMeasureIndexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        // Ensure that measureIndex is an integer or empty
        if (/^[0-9]+$/.test(value)) {
            setSecondMeasureIndex(parseInt(value, 10));
        }
        else {
            setSecondMeasureIndex(0);
        }
    };

    const addNote = () => {
        if (score.current) {
            score.current.addNoteInMeasure(
                /*measure index*/ measureIndex,
                /*keys*/keys.split(','),
                /*duration*/ duration,
                /*noteId*/ noteId
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
                /*noteId*/ noteId
            );
        }
    };

    const addTieBetweenNotes = () => {
        if (score.current) {
            score.current.addTieBetweenNotes(
                firstNoteId,
                firstMeasureIndex,
                secondNoteId,
                secondMeasureIndex
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
                <label htmlFor="noteId">Insert note id:</label>
                <input
                    type="text"
                    id="noteId"
                    value={noteId}
                    onChange={handleNoteIdChange}
                />
            </div>
            <button onClick={addNote}>Add note!</button>
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
            <div>
            <label htmlFor="noteId">Insert second note id:</label>
                <input
                    type="text"
                    id="secondNoteId"
                    value={secondNoteId}
                    onChange={handleSecondNoteIdChange}
                />
                 <label htmlFor="measureIndex">Insert second measure index:</label>
                <input
                    type="text"
                    id="secondMeasureIndex"
                    value={secondMeasureIndex.toString()}
                    onChange={handleSecondMeasureIndexChange}
                />
            </div>
            <button onClick={addTieBetweenNotes}>Add Tie between notes</button>
            <div ref={notationRef}></div>
        </div>
    );
};
