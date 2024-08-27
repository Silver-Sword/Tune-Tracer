import React, { useEffect, useRef, useState } from 'react';
import Vex, { Formatter } from 'vexflow';
import { Score } from './Score';

const TestObjectsEditor: React.FC = () => {
    const notationRef = useRef<HTMLDivElement>(null);
    const score = useRef<Score | null>(null);

    // State for each input field
    const [keys, setKeys] = useState('');
    const [duration, setDuration] = useState('');
    const [measureIndex, setMeasureIndex] = useState<number>(0);
    const [noteId, setNoteId] = useState('');
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
        else
        {
            setMeasureIndex(0);
        }
    };

    const handleNoteIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNoteId(event.target.value);
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

    const modifyDuration= () => {
        if (score.current) {
            score.current.modifyDurationInMeasure(
                /*measure index*/ measureIndex,
                /*duration*/ duration,
                /*noteId*/ noteId
            );
        }
    };

    useEffect(() => {
        const clearSVG = () => {
            if (notationRef.current) {
                notationRef.current.innerHTML = '';
            }
        };

        const renderNotation = () => {
            // It seems that the measure width is separate from how
            // the formatter width works with voices. Subtracting 25 at when formatting helps the
            // notes fit better with a smaller staff. 
            if (notationRef.current) {
                score.current = new Score(
                    notationRef.current,
                    /*defaultx*/ 10,
                    /*defaulty*/ 40,
                    /*Measure Width*/ 325
                );
            }
        };

        clearSVG();
        renderNotation();
    }, []);

    return (
        <div>
            <div ref={notationRef}></div>
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
        </div>
    );
};

export default TestObjectsEditor;
