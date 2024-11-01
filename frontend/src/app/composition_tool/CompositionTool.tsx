'use client'; // IMPORTANT as Vexflow only renders in the DOM

import React, { useEffect, useRef, useState } from "react";
import { Score } from "../edit/Score";
// We have two of these for some reason
//import { printScoreData, ScoreData } from "../lib/src/ScoreData";
import { getDefaultScoreData, printScoreData, ScoreData } from '../../../../lib/src/ScoreData';
import { Document } from "../lib/src/Document";
import { DocumentMetadata, ShareStyle } from "../lib/src/documentProperties";
import { Comment } from "../lib/src/Comment";
import {
    AppShell,
    Container,
    Button,
    Space,
    keys,
} from "@mantine/core";

import { getUserID, getDisplayName, getEmail, getDocumentID } from "../cookie";
import { increasePitch, lowerPitch } from './pitch'
import { ToolbarHeader } from './ToolbarHeader'
import { useSearchParams } from "next/navigation";

import * as d3 from 'd3';
import * as Tone from 'tone';
import { access, write } from "fs";
import { HookCallbacks } from "async_hooks";
import { removeAllListeners } from "process";

const DEFAULT_RENDERER_WIDTH = 1000;
const DEFAULT_RENDERER_HEIGHT = 2000;

export default function CompositionTool() {
    const notationRef = useRef<HTMLDivElement>(null);
    const score = useRef<Score | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const [selectedNoteId, setSelectedNoteId] = useState<number>(-1);

    const [volume, setVolume] = useState<number>(50);
    let topPart: Tone.Part;
    let bottomPart: Tone.Part;
    const [piano, setPiano] = useState<Tone.Sampler>();
    const volumeNode = useRef<Tone.Volume>();
    const searchParams = useSearchParams();
    const email = useRef<string>();
    const userId = useRef<string>();
    const displayName = useRef<string>();
    const documentID = useRef<string>();

    // Wrapper function to call modifyDurationInMeasure with the score object
    const modifyDurationHandler = (duration: string, noteId: number) => {
        if (score && score.current) {
            score.current.modifyDurationInMeasure(duration, noteId);
            sendChanges();
            setTimeout(() => {
                d3.selectAll('.vf-stavenote').classed('selected-note', false);

                const noteElement = document.getElementById(noteId.toString());
                if (noteElement) {
                    noteElement.classList.add('selected-note');
                }
            }, 0);
        }
    }

    // Wrapper functions to call modifyDuration specifically for dots
    const dotHandler = ( dotType: number, noteId: number) => {
        if (score && score.current) {
            const duration = score.current.findNote(noteId)?.getDuration();
            
            if (dotType == 1 ) {
                score.current.modifyDurationInMeasure(duration + "d", noteId);
            }
            if (dotType == 2) {
                score.current.modifyDurationInMeasure(duration + "dd", noteId);
            }

            sendChanges();
            setTimeout(() => {
                d3.selectAll('.vf-stavenote').classed('selected-note', false);

                const noteElement = document.getElementById(noteId.toString());
                if (noteElement) {
                    noteElement.classList.add('selected-note');
                }
            }, 0);
        }
    }

    // Wrapper function to add a measure
    const addMeasureHandler = () => {
        if (score && score.current) {
            score.current.addMeasure();
            sendChanges();
        }
    }

    // Wrapper function to delete a measure
   const removeMeasureHandler = () => {
    if (score && score.current) {
            score.current.removeMeasure();
            sendChanges();
        }
    }

    // Wrapper function to add a tie to a note
    const addTieHandler = (noteId: number) => {
        if (score && score.current) {
            score.current.addTie(noteId);
            sendChanges();
            setTimeout(() => {
                d3.selectAll('.vf-stavenote').classed('selected-note', false);

                const noteElement = document.getElementById(noteId.toString());
                if (noteElement) {
                    noteElement.classList.add('selected-note');
                }
            }, 0);
        }
    }

    // Wrapper function to remove a tie to a note
    const removeTieHandler = (noteId: number) => {
        if (score && score.current) {
            score.current.removeTie(noteId);
            sendChanges();
            setTimeout(() => {
                d3.selectAll('.vf-stavenote').classed('selected-note', false);

                const noteElement = document.getElementById(noteId.toString());
                if (noteElement) {
                    noteElement.classList.add('selected-note');
                }
            }, 0);
        }
    }

    // Wrapper function for naturals
    const addNaturalHandler = (keys: string[], noteId: number) => {
        if (score && score.current) {
            score.current.addNatural(keys, noteId);
            sendChanges();
            setTimeout(() => {
                d3.selectAll('.vf-stavenote').classed('selected-note', false);

                const noteElement = document.getElementById(noteId.toString());
                if (noteElement) {
                    noteElement.classList.add('selected-note');
                }
            }, 0);
        }
    }

    // Wrapper function for sharps
    const addSharpHandler = (keys: string[], noteId: number) => {
        if (score && score.current) {
            score.current.addSharp(keys, noteId);
            sendChanges();
            setTimeout(() => {
                d3.selectAll('.vf-stavenote').classed('selected-note', false);

                const noteElement = document.getElementById(noteId.toString());
                if (noteElement) {
                    noteElement.classList.add('selected-note');
                }
            }, 0);
        }
    }

    // Wrapper function for flats
    const addFlatHandler = (keys: string[], noteId: number) => {
        if (score && score.current) {
            score.current.addFlat(keys, noteId);
            sendChanges();
            setTimeout(() => {
                d3.selectAll('.vf-stavenote').classed('selected-note', false);

                const noteElement = document.getElementById(noteId.toString());
                if (noteElement) {
                    noteElement.classList.add('selected-note');
                }
            }, 0);
        }
    }

    // Wrapper function for keySignature
    const setKeySignatureHandler = (keySignature: string) => {
        if (score && score.current) {
            score.current.setKeySignature(keySignature);
            sendChanges();
        }
    }  

    const playbackAwaiter = async () => {
        await Tone.start();
        console.log('Context started');
        playbackComposition();
    }

    const stopPlayback = () => {
        // Dispose of parts
        if (topPart) {
            topPart.stop();
            topPart.clear();
            topPart.dispose();
        }
        if (bottomPart) {
            bottomPart.stop();
            bottomPart.clear();
            bottomPart.dispose();
        }

        // Kill any audio that is currently playing
        Tone.getTransport().stop();
        // Reset the position to the start
        Tone.getTransport().position = 0;
        Tone.getTransport().cancel();

        // Hide the cursor
        const svg = d3.select(notationRef.current).select('svg');
        svg.select('#playback-cursor').attr('opacity', 0);
    }

    // Create a cursor to follow notes during playback
    const createCursor = () => {
        const svg = d3.select(notationRef.current).select('svg');
    
        // Remove existing cursor if any
        svg.select('#playback-cursor').remove();
    
        // Get the dimensions of the SVG to set the cursor height
        const svgHeight = parseFloat(svg.attr('height'));
        const svgWidth = parseFloat(svg.attr('width'));
    
        // Create the cursor line
        // Start the opacity as 0 to hide it
        svg.append('line')
            .attr('id', 'playback-cursor')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', 280)
            .attr('stroke', 'red')
            .attr('stroke-width', 4)
            .attr('opacity', 0);
    };
    
    const moveCursorToPosition = (xPosition: number, duration: number, systemY: number, systemHeight: number) => {
        const svg = d3.select(notationRef.current).select('svg');
        const cursor = svg.select('#playback-cursor');

        // Set cursor opacity to 100 to make it visible
        cursor.attr('opacity', 100);

        // cursor.attr('x1', xPosition)
        //     .attr('x2', xPosition);

        cursor.transition()
            .duration(duration * 1000)
            .ease(d3.easeLinear)
            .attr('x1', xPosition)
            .attr('x2', xPosition)
            .attr('y1', systemY)
            .attr('y2', systemY + systemHeight);
    }

    // Function to play composition
    const playbackComposition = async () => {
        stopPlayback();

        createCursor();

        // Access the systems from the score
        const systems = score.current?.getSystems();

        await Tone.loaded();

        if (score && score.current) {
            const scoreData = score.current.exportScoreDataObj();
            const topMeasureData = scoreData.topMeasures;
            const bottomMeasureData = scoreData.bottomMeasures;
            const topMeasures = score.current.getTopMeasures();
            const bottomMeasures = score.current.getBottomMeasures();

            // Map for durations since ToneJS and VexFlow use different
            // representation strings for duration
            const durationMap: { [duration: string]: string } = {
                'q': '4n',
                'w': '1n',
                'h': '2n',
                '8': '8n',
                '16': '16n',
                '32': '32n',
                'qr': '4n',
                'wr': '1n',
                'hr': '2n',
                '8r': '8n',
                '16r': '16n',
                '32r': '32n'
            };

            // Create two separate parts. One for treble clef, one for bass clef
            topPart = new Tone.Part();
            bottomPart = new Tone.Part();

            // Keep track of the current time for each measure separately
            let currentTimeTop = 0;
            let currentTimeBottom = 0;

            // Grab references to svg elements for their coordinates
            const svgElement = notationRef.current?.querySelector('svg');
            const svgRect = svgElement?.getBoundingClientRect();

            // Keep a track of our noteID
            let noteIdTracker: number = 0;

            // Iterate over each measure
            for (let i = 0; i < topMeasureData.length; i++) {
                const topNotes = topMeasureData[i].notes;
                const bottomNotes = bottomMeasureData[i].notes;

                // Determine which system the measure belongs to
                const systemIndex = score.current.getSystemIndexForMeasure(i);
                let systemInfo: {y: number; height: number} = {y: 0, height: 0};
                if (systems)
                {
                    systemInfo = systems[systemIndex]
                }

                console.log(`The length of topNotes is: ${topNotes.length}`);

                // 1. Remove the '/' from the note string
                // 2. Map the duration to a string that ToneJs likes (q -> 4n, w -> 1n, 8 -> 8n, h -> 2n)

                // Iterate over notes in treble clef
                for (let j = 0; j < topNotes.length; j++) {
                    const durationTop = durationMap[topNotes[j].duration];
                    const isRest = topNotes[j].duration.includes('r');

                    // Since noteIds are deterministic we can keep track of how many notes
                    // have been iterated over and use that as the noteId
                    const noteId = noteIdTracker++;

                    // Schedule the part to be played
                    for (let k = 0; k < topNotes[j].keys.length; k++) {
                        const sanitizedKeyTop = topNotes[j].keys[k].replace('/', '');
                        const noteElement = document.getElementById(noteId.toString());
                        // let noteX = noteElement ? noteElement.getBoundingClientRect().left : 0;

                        // Since these coordinates are viewport based at first,
                        // we have to make them relative to the SVG container 
                        let noteX = 0;
                        if (noteElement && svgRect?.left)
                        {
                            const noteRect = noteElement.getBoundingClientRect();
                            noteX = noteRect.left - svgRect?.left;
                        }

                        topPart.add({
                            time: currentTimeTop,
                            note: sanitizedKeyTop,
                            duration: durationTop,
                            noteId: noteId,
                            noteX: noteX,
                            systemY: systemInfo.y,
                            systemHeight: systemInfo.height,
                            isRest: isRest,
                        });
                    }

                    // Update currentTime
                    currentTimeTop += Tone.Time(durationTop).toSeconds();
                }

                // Iterate over the notes in the bass clef
                for (let j = 0; j < bottomNotes.length; j++) {
                    const durationBottom = durationMap[bottomNotes[j].duration];
                    const isRest = bottomNotes[j].duration.includes('r');

                    const noteId = noteIdTracker++;

                    // Schedule the notes for the bass clef
                    for (let k = 0; k < bottomNotes[j].keys.length; k++) {
                        const sanitizedKeyBottom = bottomNotes[j].keys[k].replace('/', '');
                        const noteElement = document.getElementById(noteId.toString());
                        // const noteX = noteElement ? noteElement.getBoundingClientRect().left : 0;

                        let noteX = 0;
                        if (noteElement && svgRect?.left)
                        {
                            const noteRect = noteElement.getBoundingClientRect();
                            noteX = noteRect.left - svgRect.left;
                        }
                        bottomPart.add({
                            time: currentTimeBottom,
                            note: sanitizedKeyBottom,
                            duration: durationBottom,
                            noteId: noteId,
                            noteX: noteX,
                            isRest: isRest,
                        });
                    }

                    // Update currentTime
                    currentTimeBottom += Tone.Time(durationBottom).toSeconds();
                }
            }

            // Configure the playback of the top and bottom parts
            topPart.callback = (time, event) => {
                if (piano && !event.isRest) {
                    piano.triggerAttackRelease(event.note, event.duration, time);
                }

                const durationInSeconds = Tone.Time(event.duration).toSeconds();

                // Schedule the highlighting
                Tone.getDraw().schedule(() => {
                    highlightNoteStart(event.noteId);
                    moveCursorToPosition(event.noteX, event.duration, event.systemY, event.systemHeight);
                }, time);

                // Scheduleing de-highlighting
                Tone.getDraw().schedule(() => {
                    highlightNoteEnd(event.noteId);
                }, time + durationInSeconds);
            };

            bottomPart.callback = (time, event) => {
                if (piano && !event.isRest) {
                    piano.triggerAttackRelease(event.note, event.duration, time);
                }

                const durationInSeconds = Tone.Time(event.duration).toSeconds();

                // Schedule highlighting
                Tone.getDraw().schedule(() => {
                    highlightNoteStart(event.noteId);
                    // moveCursorToPosition(event.noteX);
                }, time);

                Tone.getDraw().schedule(() => {
                    highlightNoteEnd(event.noteId);
                }, time + durationInSeconds);
            };

            // Start from the beginning
            topPart.start(0);
            bottomPart.start(0);

            Tone.getTransport().start();
        }
    }

    const highlightNoteStart = (noteId: string) => {
        // console.log(`Highlight note start running at note id: ${noteId}`);
        d3.select(`[id="${noteId}"]`).classed('highlighted', true);
    }

    const highlightNoteEnd = (noteId: string) => {
        d3.select(`[id="${noteId}"]`).classed('highlighted', false);
    }

    // Wrapper function to call addNoteInMeasure
    const addNoteHandler = (notes: string[], noteId: number) => {
        if (score && score.current) {
            score.current.addNoteInMeasure(notes, noteId);
            setSelectedNoteId(noteId);
            sendChanges();

            // Manually reapply the 'selected-note' class
            const noteElement = document.getElementById(noteId.toString());
            if (noteElement) {
                noteElement.classList.add('selected-note');
            }
        }
    }

    // Wrapper function to call removeNote
    const removeNoteHandler = (keys: string[], noteId: number) => {
        if (score && score.current) {
            score.current.removeNote(keys, noteId);
            sendChanges();

            setTimeout(() => {
                d3.selectAll('.vf-stavenote').classed('selected-note', false);

                const noteElement = document.getElementById(noteId.toString());
                if (noteElement) {
                    noteElement.classList.add('selected-note');
                }
            }, 0);
        }
    }

    useEffect(() => {
        const loadSamples = async () => {
            await Tone.loaded();
        };

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
                    DEFAULT_RENDERER_WIDTH,
                    undefined
                );
            }
        };

        volumeNode.current = new Tone.Volume(0).toDestination();

        setPiano(
            new Tone.Sampler({
                urls: {
                    "A3": "A3.mp3",
                    "B3": "B3.mp3",
                    "C3": "C3.mp3",
                    "D3": "D3.mp3",
                    "E3": "E3.mp3",
                    "F3": "F3.mp3",
                    "G3": "G3.mp3",
                    "A4": "A4.mp3",
                    "B4": "B4.mp3",
                    "C4": "C4.mp3",
                    "D4": "D4.mp3",
                    "E4": "E4.mp3",
                    "F4": "F4.mp3",
                    "G4": "G4.mp3",
                    "A5": "A5.mp3",
                    "B5": "B5.mp3",
                    "C5": "C5.mp3",
                    "D5": "D5.mp3",
                    "E5": "E5.mp3",
                    "F5": "F5.mp3",
                    "G5": "G5.mp3",
                },
                release: 1,
                baseUrl: "/piano/",
            }).connect(volumeNode.current)
        );

        // Save user info
        email.current = getEmail();
        displayName.current = getDisplayName();
        userId.current = getUserID();
        documentID.current = searchParams.get('id') || 'null';
        console.log(`Document ID: ${documentID.current}`);

        loadSamples();
        clearSVG();
        renderNotation();
    }, []);

    // Update volume every time the slider is moved
    useEffect(() => {
        if (volumeNode.current) {
            volumeNode.current.volume.value = Tone.gainToDb(volume / 100);
        }
    }, [volume]);

    const SUBSCRIBE_TO_DOC_URL = 'https://us-central1-l17-tune-tracer.cloudfunctions.net/subscribeToDocument';
    const SUBSCRIBE_TO_COMMENTS_URL = 'https://us-central1-l17-tune-tracer.cloudfunctions.net/subscribeToComments';
    const CHECK_CHANGE_URL = 'https://us-central1-l17-tune-tracer.cloudfunctions.net/checkDocumentChanges';
    const UPDATE_CURSOR_URL = 'https://us-central1-l17-tune-tracer.cloudfunctions.net/updateUserCursor';
    const CHECK_ACCESS_LEVEL_URL = 'https://us-central1-l17-tune-tracer.cloudfunctions.net/getUserAccessLevel';

    const [currentDocument, setDocument] = useState<Document>({
        document_title: '',
        comments: [],
        score: {} as ScoreData,
        metadata: {} as DocumentMetadata,
    });
    const [loaded, setLoadState] = useState<boolean>(false);
    const [changes, setChanges] = useState<Record<string, unknown>>({});

    const [userTemp, setUserTemp] = useState("");

    const sendChanges = async () => {
        if (score.current === null) return;
        let exportedScoreDataObj: ScoreData = score.current.exportScoreDataObj();
        const UPDATE_URL = 'https://us-central1-l17-tune-tracer.cloudfunctions.net/updatePartialDocument';

        const changesTemp =
        {
            documentChanges: { score: exportedScoreDataObj },
            documentId: documentID.current,
            writerId: userId.current,
        }
        console.log("Exporting Score data: " + printScoreData(exportedScoreDataObj));
        // var recordTemp: Record<string, unknown> = changes;
        // if (!('score' in recordTemp)) {
        //     recordTemp['score'] = exportedScoreDataObj;
        // }
        // else {
        //     (recordTemp['score'] as ScoreData) = exportedScoreDataObj;
        // }

        // setChanges(recordTemp);

        const PUT_OPTION = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(changesTemp)
        }

        await fetch(CHECK_CHANGE_URL, PUT_OPTION);
        await fetch(UPDATE_URL, PUT_OPTION);
    }

    const fetchChanges = async () => {
        const changesTemp =
        {
            documentId: documentID.current,
            writerId: userId.current
        };
        
        const PUT_OPTION = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(changesTemp)
        }
        console.log(JSON.stringify(changesTemp));
        await fetch(CHECK_CHANGE_URL, PUT_OPTION)
            .then((res) => {
                res.json().then((value) => {
                    console.log("Recieved Score data: " + JSON.stringify(value.data));
                    const compData: ScoreData = (value.data.document).score;
                    const document_title: string = (value.data.document).document_title;
                    const comments: Comment[] = (value.data.document).comments;
                    const metadata: DocumentMetadata = (value.data.document).metadata;
                    const tempDocument: Document = {
                        document_title: document_title,
                        comments: comments,
                        score: compData,
                        metadata: metadata,
                    };
                    setDocument(tempDocument);
                    if (notationRef.current) {
                        score.current?.loadScoreDataObj(compData);
                        console.log("LOADED SCORE DATA");
                        console.log("asd selectedNoteId: " + selectedNoteId);
                        // Now add it to the currently selected note
                        if (selectedNoteId !== -1) {
                            console.log("Reached selectedNoteId: " + selectedNoteId);
                            d3.select(`[id="${selectedNoteId}"]`).classed('selected-note', true);
                        }
                    }
                }).catch((error) => {
                    // Getting the Error details.
                    const message = error.message;
                    console.log(`Error: ${message}`);
                    return;
                });;
            });
    }

    // check if the user has edit access and update tools accordingly
    useEffect(() => {
        doesUserHaveEditAccess();
    }, []);

    const doesUserHaveEditAccess = async () => {
        // NOTE: documentId and userId are assumed to be set (but are probably not in reality) (move this code to somewhere where they are)
        const data = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId.current,
                documentId: documentID.current,
            })
        };

        const accessLevel = await fetch(CHECK_ACCESS_LEVEL_URL, data)
        .then((res) => res.json().then((data) => {
            console.log(`Access Level Response: ${data.data}`); 
            const hasWriteAcces: boolean = data.data >= ShareStyle.WRITE;
        }));
    };

    function useInterval(callback: () => void, delay: number | null) {
      const savedCallback = useRef<() => void>();
    
      // Remember the latest callback.
      useEffect(() => {
        savedCallback.current = callback;
      }, [callback]);
    
      // Set up the interval.
      useEffect(() => {
        function tick() {
          if (savedCallback.current) {
            savedCallback.current();
          }
        }
        if (delay !== null) {
          const id = setInterval(tick, delay);
          return () => clearInterval(id);
        }
      }, [delay]);
    }
    
    

    // THIS FETCHES CHANGES PERIODICALLY
    // UNCOMMENT below to actually do it.
    // useInterval(() => {
    //     // Your custom logic here
    //     fetchChanges();
    //   }, 500); // .5 seconds

    const handleScoreNameChange = async (event: { currentTarget: { value: string; }; }) => {
        const value = event.currentTarget.value;
        if (score.current === null) return;

        score.current.setTitle(value);
        let exportedScoreDataObj: ScoreData = score.current.exportScoreDataObj();

        const changesTemp =
        {
            documentChanges: { score: exportedScoreDataObj },
            documentId: documentID.current,
            userId: userId.current
        }
        //console.log("Exporting Score data: " + printScoreData(exportedScoreDataObj));
        var recordTemp: Record<string, unknown> = changes;
        if (!('score' in recordTemp)) {
            recordTemp['score'] = exportedScoreDataObj;
        }
        else {
            (recordTemp['score'] as ScoreData) = exportedScoreDataObj;
        }

        setChanges(recordTemp);

        const PUT_OPTION = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(changesTemp)
        }
        await fetch(CHECK_CHANGE_URL, PUT_OPTION)
            .then((res) => {
                res.json().then((data) => {
                    const compData: ScoreData = (data.data.document).score;
                    const document_title: string = (data.data.document).document_title;
                    const comments: Comment[] = (data.data.document).comments;
                    const metadata: DocumentMetadata = (data.data.document).metadata;
                    const tempDocument: Document = {
                        document_title: document_title,
                        comments: comments,
                        score: compData,
                        metadata: metadata,
                    };
                    setDocument(tempDocument);
                    // console.log("Recieved Score data: " + printScoreData(compData));
                    // if (notationRef.current) {
                    //     score.current = new Score(notationRef.current, DEFAULT_RENDERER_HEIGHT, DEFAULT_RENDERER_WIDTH, undefined, undefined, compData);
                    // }
                }).catch((error) => {
                    // Getting the Error details.
                    const message = error.message;
                    console.log(`Error: ${message}`);
                    return;
                });;
            });
    }


    // loads in background

    // for networking
    useEffect(() => {
        if (!loaded && userId.current !== '') {
            var userInfo = {
                documentId: documentID.current,
                userId: userId.current,
                user_email: email.current,
                displayName: displayName.current
            };
            console.log("document ID: " + documentID.current);

            // if (userTemp === '1') {
            //     userInfo = {
            //         documentId: 'aco5tXEzQt7dSeB1WSlV',
            //         userId: '70E8YqG5IUMJ9DNMHtEukbhfwJn2',
            //         user_email: 'sophiad03@hotmail.com',
            //         displayName: 'Sopa'
            //     };
            // }
            // else if (userTemp === '2') {
            //     userInfo = {
            //         documentId: 'aco5tXEzQt7dSeB1WSlV',
            //         userId: 'OgGilSJwqCW3qMuHWlChEYka9js1',
            //         user_email: 'test-user-1@tune-tracer.com',
            //         displayName: 'test_one'
            //     }

            // }
            // else {
            //     return;
            // }
            console.log("User Info: " + JSON.stringify(userInfo));

            const POST_OPTION = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userInfo),
            }
            fetch(SUBSCRIBE_TO_DOC_URL, POST_OPTION)
                .then((res) => {
                    // Read result of the Cloud Function.
                    res.json().then((data) => {
                        const compData: ScoreData = (data.data.document).score;
                        const document_title: string = (data.data.document).document_title;
                        const comments: Comment[] = (data.data.document).comments;
                        const metadata: DocumentMetadata = (data.data.document).metadata;
                        const tempDocument: Document = {
                            document_title: document_title,
                            comments: comments,
                            score: compData,
                            metadata: metadata,
                        };
                        setDocument(tempDocument);
                        // console.log("Document:" + currentDocument);
                        setLoadState(true);
                        // console.log("Recieved Score data: " + printScoreData(compData));
                        // if (notationRef.current) {
                        //     score.current = new Score(notationRef.current, DEFAULT_RENDERER_HEIGHT, DEFAULT_RENDERER_WIDTH, undefined, undefined, compData);
                        // }

                        console.log("Document Loaded");
                        var temp = !loaded;
                        setLoadState(temp);
                    });
                }).catch((error) => {
                    // Getting the Error details.
                    const message = error.message;
                    console.log(`Error: ${message}`);
                    return;
                    // ...
                });
            fetchChanges();
        }
    }, []);

    useEffect(() => {
        if (userTemp !== '1') {
            console.log("No user");
            return;
        }
        const intervalID = setInterval(() => {

            const changesTemp =
            {
                documentId: documentID.current,
                writerId: userId.current
            }
            const POST_OPTION = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(changesTemp),
            }
            console.log(`Check Changes Input: ${JSON.stringify(changesTemp)}`);
            fetch(CHECK_CHANGE_URL, POST_OPTION)
                .then((res) => {
                    res.json().then((data) => {
                        const compData: ScoreData = (data.data.document).score;
                        const document_title: string = (data.data.document).document_title;
                        const comments: Comment[] = (data.data.document).comments;
                        const metadata: DocumentMetadata = (data.data.document).metadata;
                        const tempDocument: Document = {
                            document_title: document_title,
                            comments: comments,
                            score: compData,
                            metadata: metadata,
                        };
                        setDocument(tempDocument);
                    }).catch((error) => {
                        // Getting the Error details.
                        const message = error.message;
                        console.log(`Error: ${message}`);
                        return;
                    });
                });
        }, 1000);

        return function stopChecking() {
            clearInterval(intervalID);
        }
    }, [userTemp]);
    useEffect(() => {
        // Attach the note selection handler to the notationRef container
        d3.select(notationRef.current)
            .on('click', function (event) {
                // Grab a reference to what we click on
                let targetElement = event.target;

                // Keep going up the DOM to look for an element that has the VF note class
                while (targetElement && !targetElement.classList.contains('vf-stavenote')) {
                    targetElement = targetElement.parentElement;
                }

                // Check to see if we've found an element in the DOM with the class we're looking for
                if (targetElement && targetElement.classList.contains('vf-stavenote')) {
                    const selectId = d3.select(targetElement).attr('id');
                    setSelectedNoteId(parseInt(selectId));
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
        if (selectedNoteId !== -1) {
            d3.select(`[id="${selectedNoteId}"]`).classed('selected-note', true);
        }

        // Update the user cursor on the backend
        updateUserCursor();

        // Keyboard shortcuts for adding notes
        const handleKeyDown = (event: KeyboardEvent) => {
            // Mapping of keyboard letters to note string
            const trebleKeyToNoteMap: { [key: string]: string } = {
                'a': 'a/4',
                'b': 'b/4',
                'c': 'c/5',
                'd': 'd/5',
                'e': 'e/5',
                'f': 'f/5',
                'g': 'g/5',
            };
            const bassKeyToNoteMap: { [key: string]: string } = {
                'a': 'a/3',
                'b': 'b/3',
                'c': 'c/4',
                'd': 'd/4',
                'e': 'e/4',
                'f': 'f/4',
                'g': 'g/4',
            }

            let isTopNote: boolean = false;
            if (score && score.current) {
                isTopNote = score.current.isTopMeasure(selectedNoteId);
            }
            const key = event.key.toLowerCase();
            const note = (isTopNote ? trebleKeyToNoteMap[key] : bassKeyToNoteMap[key]);

            // If a valid note was pressed and we have a note selected
            if (note && selectedNoteId !== -1) {
                addNoteHandler([note], selectedNoteId);
                const nextNote = score.current?.getAdjacentNote(selectedNoteId);
                if (nextNote) {
                    setSelectedNoteId(nextNote);
                }
            }

            // If we press the up arrow, raise the pitch
            if (key === 'w') {
                const newNotes = increasePitch(score, selectedNoteId);
                const staveNote = score.current?.findNote(selectedNoteId);
                if (staveNote) {
                    removeNoteHandler(staveNote.keys, selectedNoteId);
                    addNoteHandler(newNotes, selectedNoteId);
                }
            }

            // If we press the down arrow, lower the pitch
            if (key === 's') {
                const newNotes = lowerPitch(score, selectedNoteId);
                const staveNote = score.current?.findNote(selectedNoteId);
                if (staveNote) {
                    removeNoteHandler(staveNote.keys, selectedNoteId);
                    addNoteHandler(newNotes, selectedNoteId);
                }
            }

            // Remove a note if backspace if pressed
            if (key === 'backspace') {
                removeNoteHandler([''], selectedNoteId);
            }
        };

        // Attach the keydown event listener
        const notationDiv = notationRef.current;
        if (notationDiv) {
            notationDiv.addEventListener('keydown', handleKeyDown);
            // Make the div focusable to capture keyboard input
            notationDiv.setAttribute('tabindex', '0');
        }

        // Clean up listener on ummount
        return () => {
            if (notationDiv) {
                notationDiv.removeEventListener('keydown', handleKeyDown);
            }
        }
    }, [selectedNoteId]);

    useEffect(() => {
        // Attach the note selection handler to the notationRef container
        d3.select(notationRef.current)
            .on('click', function (event) {
                // Grab a reference to what we click on
                let targetElement = event.target;

                // Keep going up the DOM to look for an element that has the VF note class
                while (targetElement && !targetElement.classList.contains('vf-stavenote')) {
                    targetElement = targetElement.parentElement;
                }

                // Check to see if we've found an element in the DOM with the class we're looking for
                if (targetElement && targetElement.classList.contains('vf-stavenote')) {
                    const selectId = d3.select(targetElement).attr('id');
                    setSelectedNoteId(parseInt(selectId));
                }
            });

        // Clean up the event listener when notationRef unmounts
        return () => {
            d3.select(notationRef.current).on('click', null);
        }
    }, [notationRef.current])

    const updateUserCursor = async () => {
        if (selectedNoteId) {
            const userInfo = {
                documentId: documentID.current,
                userId: userId,
                user_email: email,
                displayName: displayName,
                cursor: selectedNoteId
            }

            const POST_OPTION = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userInfo)
            }

            fetch(UPDATE_CURSOR_URL, POST_OPTION)
                .then((res) => {
                    res.json().then((data) => {
                        console.log('Successfully called updateCursor endpoint');
                        console.log(`User cursor data: ${data.data}`);
                    })
                })
        }
    };

    return (
        <AppShell
            header={{ height: 180 }}
            // navbar={{
            //     width: 150,
            //     breakpoint: "sm",
            // }}
            // aside={{
            //     width: 300,
            //     breakpoint: "sm",
            // }}
            padding="md"
            styles={{
                main: {
                    backgroundColor: '#fafafa',
                },
            }}
        >
            <AppShell.Main>
                <ToolbarHeader
                    documentName={currentDocument.document_title}
                    modifyDurationInMeasure={modifyDurationHandler}
                    selectedNoteId={selectedNoteId}
                    playbackComposition={playbackAwaiter}
                    stopPlayback={stopPlayback}
                    volume={volume}
                    onVolumeChange={setVolume}
                    addMeasure={addMeasureHandler}
                    removeMeasure={removeMeasureHandler}
                    addTie={addTieHandler}
                    removeTie={removeTieHandler}
                    addSharp={addSharpHandler}
                    addNatural={addNaturalHandler}
                    addFlat={addFlatHandler}
                    // removeAccidentals={removeAccidentalsHandler}
                    setKeySignature={setKeySignatureHandler}
                    handleDot={dotHandler}
                />
                {/* <CommentAside /> */}

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
                            "#FFFFFF",
                        boxShadow: '0 0px 5px rgba(0, 0, 0, 0.3)', // Shadow effect
                        borderRadius: '4px', // Rounded corners for a more "page" look
                        margin: '20px', // Space around AppShell to enhance the effect
                        border: '1px solid #e0e0e0', // Border around the AppShell
                    }}
                >
                    <Space h="xl"></Space>
                    {/* <input
                        type="text"
                        value={currentDocument?.score?.title}
                        onChange={handleScoreNameChange}
                        placeholder={currentDocument?.score?.title}
                    />
                    <input
                        type="text"
                        value={userTemp}
                        onChange={handleUserIdChange}
                        placeholder={userTemp}
                    />
                    <Button onClick={sendChanges}>Send Score change</Button>*/}
                    {/* <Button onClick={fetchChanges}>fetch Score change</Button>  */}
                    <div>
                        <div ref={notationRef}></div>
                    </div>
                </Container>
            </AppShell.Main>
        </AppShell>
    );
}