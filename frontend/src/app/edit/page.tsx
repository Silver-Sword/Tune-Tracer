'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Score } from './Score';
import * as d3 from 'd3';
import { Button } from '@mantine/core';
import { MeasureData } from '../../../../lib/src/MeasureData'; // edit the tsconfig file to include this import


const DEFAULT_RENDERER_WIDTH = 1000;
const DEFAULT_RENDERER_HEIGHT = 2000;

export default function Editor() {
    const notationRef = useRef<HTMLDivElement>(null);
    const score = useRef<Score | null>(null);

    // State for each input field


    const [addKeys, setAddKeys] = useState('');
    const [addNoteId, setAddNoteId] = useState<number>(0);


    const [duration, setDuration] = useState('');
    const [durationNoteId, setDurationNoteId] = useState<number>(0);

    const [removeKeys, setRemoveKeys] = useState('');
    const [removeNoteId, setRemoveNoteId] = useState<number>(0);

    const [tieNoteId, setTieNoteId] = useState<number>(0);

    const [selectedNoteId, setSelectedNoteId] = useState(-1);

    const setNumberValue = (value: string): number => {
        if (/^[0-9]+$/.test(value)) {
            return parseInt(value, 10);
        }
        else {
            return 0;
        }
    }
    // Handlers for input changes
    const handleAddKeysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAddKeys(event.target.value);
    };
    const handleAddNoteIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAddNoteId(setNumberValue(event.target.value));
    };


    const handleRemoveKeysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRemoveKeys(event.target.value);
    };
    const handleRemoveNoteIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRemoveNoteId(setNumberValue(event.target.value));
    };

    const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDuration(event.target.value);
    };

    const handleDurationNoteIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDurationNoteId(setNumberValue(event.target.value));
    };

    // Adding a Tie
    const handleTieNoteIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTieNoteId(setNumberValue(event.target.value));
    };

    const addNote = () => {
        if (score.current) {
            score.current.addNoteInMeasure(
                /*keys*/addKeys.split(','),
                /*noteId*/ addNoteId
            );
        }
    };

    const removeNote = () => {
        if (score.current) {
            score.current.removeNote(
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
                /*duration*/ duration,
                /*noteId*/ durationNoteId
            );
        }
    };

    const addTie = () => {
        if (score.current) {
            score.current.addTie(
                tieNoteId
            );
        }
    }

    const removeTie = () => {
        if (score.current) {
            score.current.removeTie(
                tieNoteId
            );
        }
    }

    const exportScore = () => {
        if (score.current) {
            score.current.exportScore();
        }
    }

    const loadMeasure = () => {
        if (score.current) {
            let measureData: MeasureData = {
                x: 20,
                y: 0,
                width: 325,
                timeSignature: "4/4",
                clef: "treble",
                renderTimeSignature: true,
                notes: [
                    {
                        keys: ["c/4"], 
                        duration: "q", 
                        dots: 0
                    },
                    {
                        keys: ["c/4"], 
                        duration: "q", 
                        dots: 0
                    },
                    {
                        keys: ["c/4,e/4,g/4"], 
                        duration: "qdd", 
                        dots: 2
                    },
                    {
                        keys: ["c/4,e/4,g/4"], 
                        duration: "32", 
                        dots: 0
                    },
                    {
                        keys: ["c/4,e/4,g/4"], 
                        duration: "32", 
                        dots: 0
                    }
                ]

            }
            score.current.loadScore(measureData);
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

    useEffect(() => {
        // Attach the note selection handler to the notationRef container
        d3.select(notationRef.current)
            .on('click', function(event) {
                // Grab a reference to what we click on
                let targetElement = event.target;

                // Keep going up the DOM to look for an element that has the VF note class
                while (targetElement && !targetElement.classList.contains('vf-stavenote')) {
                    targetElement = targetElement.parentElement;
                }

                // Check to see if we've found an element in the DOM with the class we're looking for
                if (targetElement && targetElement.classList.contains('vf-stavenote')) {
                    const selectId = d3.select(targetElement).attr('id');
                    handleNoteClick(parseInt(selectId));
                }
            });
        
        // Clean up the event listener when notationRef unmounts
        return () => {
            d3.select(notationRef.current).on('click', null);
        }
    }, [notationRef.current])

    useEffect(() => {
        // First remove the selectd note class from previously selected note
        d3.selectAll('.vf-stavenote').classed('selected-note', false);

        // Now add it to the currently selected note
        if (selectedNoteId !== -1)
        {
            d3.select(`[id="${selectedNoteId}"]`).classed('selected-note', true);
        }
    }, [selectedNoteId]);

    // Handle clicking on notes
    const handleNoteClick = (index: number) => {
        setSelectedNoteId(index);
        console.log(`Selected index is: ${index}`);
    }

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
                <label htmlFor="noteId">Insert note id:</label>
                <input
                    type="text"
                    id="firstNoteId"
                    value={tieNoteId}
                    onChange={handleTieNoteIdChange}
                />
            </div>
            <button onClick={addTie}>Add Tie </button>
            <button onClick={removeTie}>Remove Tie </button>
            <button onClick={exportScore}>Export Score</button>
            <button onClick={loadMeasure}>Load Measure</button>
            <div ref={notationRef}></div>
        </div>
    );
};
