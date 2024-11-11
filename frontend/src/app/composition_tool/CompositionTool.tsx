'use client'; // IMPORTANT as Vexflow only renders in the DOM

import React, { useEffect, useRef, useState } from "react";
import { Score } from "../edit/Score";
import { createPlaceNoteBox, attachMouseMoveListener, attachMouseLeaveListener, attachMouseClickListener } from "./PlaceNoteBox";
import {
    AppShell,
    Container,
    Button,
    Space,
    keys,
} from "@mantine/core";

import { getUserID, getDisplayName, getEmail, getDocumentID, getCursorColor } from "../cookie";
import { areUserListsEqual } from './list';
import { increasePitch, lowerPitch, shiftNoteDown, shiftNoteUp } from './pitch'
import { ToolbarHeader } from './ToolbarHeader'
import { useSearchParams } from "next/navigation";

// We have two of these for some reason
//import { printScoreData, ScoreData } from "../lib/src/ScoreData";
import { getDefaultScoreData, printScoreData, ScoreData } from '../../../../lib/src/ScoreData'; // Note this path is to a folder outside of the root directory
import { Document } from "../lib/src/Document";
import { DocumentMetadata, ShareStyle } from "../lib/src/documentProperties";
import { Comment } from "../lib/src/Comment";
import { OnlineEntity } from "../lib/src/realtimeUserTypes";
import { SelectedNote } from "../lib/src/SelectedNote";

import * as d3 from 'd3';
import { Selection } from 'd3';
import * as Tone from 'tone';
import { useRouter } from "next/navigation";
import { access, write } from "fs";
import { HookCallbacks } from "async_hooks";
import { removeAllListeners } from "process";
import { callAPI } from "../../utils/callAPI";

const DEFAULT_RENDERER_WIDTH = 1000;
const DEFAULT_RENDERER_HEIGHT = 2000;

// Define the type
export type SendChangesType = () => Promise<void>;
export type CreateNewNoteBoxType = () => void;

export default function CompositionTool() {
    const router = useRouter();
    const notationRef = useRef<HTMLDivElement>(null);
    const score = useRef<Score | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
    let selectedNoteId = useRef<number>(-1);
    const [selectedNoteHeadId, setSelectedNoteHeadId] = useState<string>('');
    let selectedKey = useRef<string>('');
    let isSending = useRef<boolean>(false);
    let isFetching = useRef<boolean>(false);
    const notePlacementRectangleSVG = useRef<SVGElement | null>(null);
    const notePlacementRectangleRef = useRef<Selection<SVGElement, unknown, null, undefined> | null>(null);
    const [notationUpdated, setNotationUpdated] = useState<number>(0);
    const [isPlayingBack, setIsPlayingBack] = useState<boolean>(false);

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
    const cursorColor = useRef<string>();
    const [hasWriteAccess, setHasWriteAccess] = useState<boolean>(true);

    // map of user ids to their online information
    const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineEntity>>(new Map<string, OnlineEntity>());
    // const [userList, setUserList] = useState<{ userId: string; displayName: string; color: string}[]>([]);
    const userList = useRef<{ userId: string; displayName: string; color: string }[]>();
    const displayNameCache = useRef<{ [userId: string]: string }>({});

    // Wrapper function to call modifyDurationInMeasure with the score object
    const modifyDurationHandler = async (duration: string, noteId: number) => {
        if (score && score.current) {

            score.current.modifyDurationInMeasure(duration, noteId);
            selectedNoteId.current = noteId;
            setNotationUpdated(prev => prev + 1);
            sendChanges();
            // setTimeout(() => {
            //     d3.selectAll('.vf-stavenote').classed('selected-note', false);

            //     const noteElement = document.getElementById(noteId.toString());
            //     if (noteElement) {
            //         noteElement.classList.add('selected-note');
            //     }
            // }, 0);
        }
    }

    // Wrapper functions to call modifyDuration specifically for dots
    const dotHandler = async (dotType: number, noteId: number) => {
        if (score && score.current) {
            const staveNote = score.current.findNote(noteId);
            if (!staveNote) return;
            const duration = staveNote?.getDuration();

            if (dotType == 1) {
                score.current.modifyDurationInMeasure(duration + "d", noteId);
            }
            else if (dotType == 2) {
                score.current.modifyDurationInMeasure(duration + "dd", noteId); 
            }
            else if (dotType == -1) {
                score.current.modifyDurationInMeasure(duration, noteId);
            }

            selectedNoteId.current = noteId;
            setNotationUpdated(prev => prev + 1);

            sendChanges();
            // setTimeout(() => {
            //     d3.selectAll('.vf-stavenote').classed('selected-note', false);

            //     const noteElement = document.getElementById(noteId.toString());
            //     if (noteElement) {
            //         noteElement.classList.add('selected-note');
            //     }
            // }, 0);
        }
    }

    // Wrapper function to add a measure
    const addMeasureHandler = async () => {
        if (score && score.current) {
            score.current.addMeasure();
            sendChanges();
        }
    }

    // Wrapper function to delete a measure
    const removeMeasureHandler = async () => {
        if (score && score.current) {
            score.current.removeMeasure();
            sendChanges();
        }
    }

    // Wrapper function to add a tie to a note
    const addTieHandler = async (noteId: number) => {
        if (score && score.current) {
            score.current.addTie(noteId);
            selectedNoteId.current = noteId;
            setNotationUpdated(prev => prev + 1);
            sendChanges();
            // setTimeout(() => {
            //     d3.selectAll('.vf-stavenote').classed('selected-note', false);

            //     const noteElement = document.getElementById(noteId.toString());
            //     if (noteElement) {
            //         noteElement.classList.add('selected-note');
            //     }
            // }, 0);
        }
    }

    // Wrapper function to remove a tie to a note
    const removeTieHandler = async (noteId: number) => {
        if (score && score.current) {
            score.current.removeTie(noteId);
            selectedNoteId.current = noteId;
            setNotationUpdated(prev => prev + 1);
            sendChanges();
            // setTimeout(() => {
            //     d3.selectAll('.vf-stavenote').classed('selected-note', false);

            //     const noteElement = document.getElementById(noteId.toString());
            //     if (noteElement) {
            //         noteElement.classList.add('selected-note');
            //     }
            // }, 0);
        }
    }

    // Wrapper function for naturals
    const addNaturalHandler = async (keys: string[], noteId: number) => {
        if (score && score.current) {
            score.current.addNatural(keys, noteId);
            selectedNoteId.current = noteId;
            setNotationUpdated(prev => prev + 1);
            sendChanges();
            // setTimeout(() => {
            //     d3.selectAll('.vf-stavenote').classed('selected-note', false);

            //     const noteElement = document.getElementById(noteId.toString());
            //     if (noteElement) {
            //         noteElement.classList.add('selected-note');
            //     }
            // }, 0);
        }
    }

    // Wrapper function for sharps
    const addSharpHandler = async (keys: string[], noteId: number) => {
        if (score && score.current) {
            score.current.addSharp(keys, noteId);
            selectedNoteId.current = noteId;
            setNotationUpdated(prev => prev + 1);
            sendChanges();
            // setTimeout(() => {
            //     d3.selectAll('.vf-stavenote').classed('selected-note', false);

            //     const noteElement = document.getElementById(noteId.toString());
            //     if (noteElement) {
            //         noteElement.classList.add('selected-note');
            //     }
            // }, 0);
        }
    }

    // Wrapper function for flats
    const addFlatHandler = async (keys: string[], noteId: number) => {
        if (score && score.current) {
            score.current.addFlat(keys, noteId);
            selectedNoteId.current = noteId;
            setNotationUpdated(prev => prev + 1);
            sendChanges();
            // setTimeout(() => {
            //     d3.selectAll('.vf-stavenote').classed('selected-note', false);

            //     const noteElement = document.getElementById(noteId.toString());
            //     if (noteElement) {
            //         noteElement.classList.add('selected-note');
            //     }
            // }, 0);
        }
    }

    const removeAccidentalsHandler = async (keys: string[], noteId: number) => {
        if (score && score.current) {
            score.current.removeAccidentals(keys, noteId);
            selectedNoteId.current = noteId;
            setNotationUpdated(prev => prev + 1);
            sendChanges();
            // setTimeout(() => {
            //     d3.selectAll('.vf-stavenote').classed('selected-note', false);

            //     const noteElement = document.getElementById(noteId.toString());
            //     if (noteElement) {
            //         noteElement.classList.add('selected-note');
            //     }
            // }, 0);
        }
    }

    // Wrapper function for keySignature
    const setKeySignatureHandler = async (keySignature: string) => {
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
        // Cancel scheduled draw events
        Tone.getDraw().cancel();

        // Hide the cursor
        const svg = d3.select(notationRef.current).select('svg');
        // svg.select('#playback-cursor').attr('opacity', 0);
        svg.select('#playback-cursor').interrupt().remove();

        setIsPlayingBack(false);
    }

    // Create a cursor to follow notes during playback
    const createCursor = () => {
        const svg = d3.select(notationRef.current).select('svg');

        // Remove existing cursor if any
        svg.select('#playback-cursor').interrupt().remove();

        // Get the dimensions of the SVG to set the cursor height
        const svgHeight = parseFloat(svg.attr('height'));
        const svgWidth = parseFloat(svg.attr('width'));

        // Create the cursor line
        // Start the opacity as 0 to hide it
        svg.append('line')
            .attr('id', 'playback-cursor')
            .attr('x1', 75)
            .attr('y1', 0)
            .attr('x2', 75)
            .attr('y2', 300)
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

        Tone.getTransport().stop();
        Tone.getTransport().position = 0;

        createCursor();

        // Access the systems from the score
        const systems = score.current?.getSystems();

        await Tone.loaded();

        if (score && score.current) {
            setIsPlayingBack(true);
            const scoreData = score.current.exportScoreDataObj();
            const topMeasureData = scoreData.topMeasures;
            const bottomMeasureData = scoreData.bottomMeasures;

            const durationMap: { [duration: string]: string } = {
                'w': '1n',
                'h': '2n',
                'q': '4n',
                '8': '8n',
                '16': '16n',
                '32': '32n',
                '64': '64n',
            };

            topPart = new Tone.Part();
            bottomPart = new Tone.Part();

            let currentTimeTop = 0;
            let currentTimeBottom = 0;

            const svgElement = notationRef.current?.querySelector('svg');
            const svgRect = svgElement?.getBoundingClientRect();

            // Keep track of noteId
            let noteIdTracker = 0;

            // Array to hold all events for cursor movement
            let allEvents = [];

            for (let i = 0; i < topMeasureData.length; i++) {
                const topNotes = topMeasureData[i].notes;
                const bottomNotes = bottomMeasureData[i].notes;

                // Get system info for the measure
                const systemIndex = score.current.getSystemIndexForMeasure(i);
                let systemInfo = { y: 0, height: 0 };
                if (systems) {
                    systemInfo = systems[systemIndex];
                }

                // Process treble clef notes
                for (let j = 0; j < topNotes.length; j++) {
                    const note = topNotes[j];
                    const isRest = note.duration.includes('r');
                    const baseDurationKey = note.duration.replace('r', '').replaceAll('d', '');
                    const baseDuration = durationMap[baseDurationKey];
                    const indexToModifierMap: Map<number, string> = new Map();
                    note.modifiers.forEach((modifier) => {
                        indexToModifierMap.set(modifier.index, modifier.modifier);
                    });

                    if (!baseDuration) {
                        console.warn(`Unknown duration: ${note.duration}`);
                        continue;
                    }

                    const dots = note.dots || 0;

                    // Adjust baseDuration to include dots
                    let durationWithDots = baseDuration;
                    for (let d = 0; d < dots; d++) {
                        durationWithDots += '.';
                    }

                    // Since noteIds are deterministic we can keep track of how many notes
                    // have been iterated over and use that as the noteId
                    const noteId = noteIdTracker++;

                    for (let k = 0; k < note.keys.length; k++) {
                        let sanitizedKey;
                        const noteElement = document.getElementById(noteId.toString());
                        let modifier = indexToModifierMap.get(k);
                        if (modifier === "b" || modifier === "#") sanitizedKey = note.keys[k].replace('/', modifier);
                        else sanitizedKey = note.keys[k].replace('/', '');

                        // Since these coordinates are viewport based at first,
                        // we have to make them relative to the SVG container
                        let noteX = 0;
                        if (noteElement && svgRect?.left) {
                            const noteRect = noteElement.getBoundingClientRect();
                            noteX = noteRect.left - svgRect.left;
                        }

                        const event = {
                            time: currentTimeTop,
                            note: sanitizedKey,
                            duration: durationWithDots,
                            noteId: noteId,
                            noteX: noteX,
                            systemIndex: systemIndex,
                            systemY: systemInfo.y,
                            systemHeight: systemInfo.height,
                            isRest: isRest,
                            staff: 'top',
                        };

                        allEvents.push(event);

                        // Add to topPart for playback
                        topPart.add(event);
                    }

                    currentTimeTop += Tone.Time(durationWithDots).toSeconds();
                }

                // Process bass clef notes
                for (let j = 0; j < bottomNotes.length; j++) {
                    const note = bottomNotes[j];
                    const isRest = note.duration.includes('r');
                    const baseDurationKey = note.duration.replace('r', '').replaceAll('d', '');
                    const baseDuration = durationMap[baseDurationKey];
                    const indexToModifierMap: Map<number, string> = new Map();
                    note.modifiers.forEach((modifier) => {
                        indexToModifierMap.set(modifier.index, modifier.modifier);
                    });

                    if (!baseDuration) {
                        console.warn(`Unknown duration: ${note.duration}`);
                        continue;
                    }

                    const dots = note.dots || 0;

                    // Adjust baseDuration to include dots
                    let durationWithDots = baseDuration;
                    for (let d = 0; d < dots; d++) {
                        durationWithDots += '.';
                    }

                    const noteId = noteIdTracker++;

                    for (let k = 0; k < note.keys.length; k++) {
                        let sanitizedKey;
                        const noteElement = document.getElementById(noteId.toString());
                        let modifier = indexToModifierMap.get(k);
                        if (modifier === "b" || modifier === "#") sanitizedKey = note.keys[k].replace('/', modifier);
                        else sanitizedKey = note.keys[k].replace('/', '');

                        let noteX = 0;
                        if (noteElement && svgRect?.left) {
                            const noteRect = noteElement.getBoundingClientRect();
                            noteX = noteRect.left - svgRect.left;
                        }

                        const event = {
                            time: currentTimeBottom,
                            note: sanitizedKey,
                            duration: durationWithDots,
                            noteId: noteId,
                            noteX: noteX,
                            systemIndex: systemIndex,
                            systemY: systemInfo.y, // Use treble clef systemY
                            systemHeight: systemInfo.height, // Use treble clef systemHeight
                            isRest: isRest,
                            staff: 'bottom',
                        };

                        allEvents.push(event);

                        // Add to bottomPart for playback
                        bottomPart.add(event);
                    }

                    currentTimeBottom += Tone.Time(durationWithDots).toSeconds();
                }
            }

            const currentTransportTime = Tone.getTransport().now();

            // Sort allEvents by time
            allEvents.sort((a, b) => a.time - b.time);

            // Schedule cursor movements based on allEvents
            let lastNoteX = -Infinity;
            let lastSystemIndex = -1;
            allEvents.forEach(event => {
                const durationInSeconds = Tone.Time(event.duration).toSeconds();
                const adjustedEventTime = currentTransportTime + event.time;

                // Check if we have moved to a new system
                if (event.systemIndex !== lastSystemIndex) {
                    // Reset values since we are in a new system
                    lastNoteX = -Infinity;
                    lastSystemIndex = event.systemIndex;
                }

                // Only schedule cursor movement if noteX is greater than lastNoteX
                if (event.noteX > lastNoteX) {
                    lastNoteX = event.noteX;

                    console.log('This is being called!')
                    Tone.getDraw().schedule(() => {
                        console.log('We are scheduling to move the cursor!');
                        moveCursorToPosition(event.noteX, durationInSeconds, event.systemY, event.systemHeight);
                    }, adjustedEventTime);
                }
            });

            // Configure the playback callbacks
            topPart.callback = (time, event) => {
                if (piano && !event.isRest) {
                    piano.triggerAttackRelease(event.note, event.duration, time);
                }

                const durationInSeconds = Tone.Time(event.duration).toSeconds();

                // Schedule highlighting
                Tone.getDraw().schedule(() => {
                    highlightNoteStart(event.noteId);
                }, time);

                // Schedule de-highlighting
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
                }, time);

                // Schedule de-highlighting
                Tone.getDraw().schedule(() => {
                    highlightNoteEnd(event.noteId);
                }, time + durationInSeconds);
            };

            // Start playback
            topPart.start(0);
            bottomPart.start(0);

            Tone.getTransport().start('+0.1');

            // Schedule stoppage of playback with a small buffer
            const totalDuration = Math.max(currentTimeBottom, currentTimeTop);
            setTimeout(() => {
                stopPlayback();
            }, totalDuration * 1000 + 100);
        }
    };

    const highlightNoteStart = (noteId: string) => {
        // console.log(`Highlight note start running at note id: ${noteId}`);
        d3.select(`[id="${noteId}"]`).classed('highlighted', true);
    }

    const highlightNoteEnd = (noteId: string) => {
        d3.select(`[id="${noteId}"]`).classed('highlighted', false);
    }

    // Wrapper function to call addNoteInMeasure
    const addNoteHandler = async (notes: string[], noteId: number, sendNetworkChanges: boolean = true) => {
        if (score && score.current) {
            score.current.addNoteInMeasure(notes, noteId);
            selectedNoteId.current = noteId;
            setNotationUpdated(prev => prev + 1);
            sendChanges();

            // Manually reapply the 'selected-note' class
            // const noteElement = document.getElementById(noteId.toString());
            // if (noteElement) {
            //     noteElement.classList.add('selected-note');
            // }
        }
    }

    // Wrapper function to call removeNote
    const removeNoteHandler = async (keys: string[], noteId: number) => {
        if (score && score.current) {

            score.current.removeNote(keys, noteId);
            selectedNoteId.current = noteId;
            setNotationUpdated(prev => prev + 1);
            sendChanges();

            // setTimeout(() => {
            //     d3.selectAll('.vf-stavenote').classed('selected-note', false);

            //     const noteElement = document.getElementById(noteId.toString());
            //     if (noteElement) {
            //         noteElement.classList.add('selected-note');
            //     }
            // }, 0);
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
        cursorColor.current = getCursorColor();
        //console.log(`Document ID: ${documentID.current}`);

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

    const [currentDocument, setDocument] = useState<Document>({
        document_title: '',
        comments: [],
        score: {} as ScoreData,
        metadata: {} as DocumentMetadata,
    });
    const [loaded, setLoadState] = useState<boolean>(false);
    const [changes, setChanges] = useState<Record<string, unknown>>({});

    const [userTemp, setUserTemp] = useState("");

    let changesTimeout: NodeJS.Timeout | null = null;
    const debounceDelay = 500; // Delay in ms, adjust as needed

    const sendChanges: SendChangesType = async () => {
        if (score.current === null) return;
        isSending.current = true;
        score.current.exportScoreDataObj(true);
        // Debounce the function to prevent rapid consecutive calls
        if (changesTimeout) {
            clearTimeout(changesTimeout);
        }

        changesTimeout = setTimeout(async () => {
            // while (isFetching || isSending) {
            //     console.log("waiting until fetching is done");
            //     await new Promise(resolve => setTimeout(resolve, 100)); // Adjust the delay if needed
            // }
            if (score.current === null) return;

            let exportedScoreDataObj: ScoreData = score.current.exportScoreDataObj();
            

            const changesTemp =
            {
                documentChanges: { score: exportedScoreDataObj },
                documentId: documentID.current,
                writerId: userId.current,
            }
            console.log("Exporting Score data ------------------------------- ");
            console.log("exported Object: " + printScoreData(exportedScoreDataObj));

            // var recordTemp: Record<string, unknown> = changes;
            // if (!('score' in recordTemp)) {
            //     recordTemp['score'] = exportedScoreDataObj;
            // }
            // else {
            //     (recordTemp['score'] as ScoreData) = exportedScoreDataObj;
            // }

            // setChanges(recordTemp);

            await callAPI("checkDocumentChanges", changesTemp);
            // await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust the delay if needed
            isSending.current = (false);
            // await fetch(UPDATE_URL, PUT_OPTION);
        }, debounceDelay);
    }

    const fetchChanges = async () => {
        const changesTemp =
        {
            documentId: documentID.current,
            writerId: userId.current
        };

        // Don't fetch while playing back
        if (isPlayingBack) {
            return;
        }

        changesTimeout = setTimeout(async () => {
            while (isSending.current || isFetching.current) {
                console.log("Waiting until send finished");
                console.log("isSending: " + isSending.current);
                console.log("isFetching: " + isFetching.current);
                await new Promise(resolve => setTimeout(resolve, 100)); // Adjust the delay if needed
            }
            console.log(JSON.stringify(changesTemp));
            isFetching.current = true;
            await callAPI("checkDocumentChanges", changesTemp)
                .then((res) => {
                    if (res.status !== 200) {
                        console.log("Error fetching changes");
                        isFetching.current = false;
                        return;
                    }
                    const receivedDocument = (res.data as any)['document'];
                    if (receivedDocument === undefined) {
                        console.error(`Something went wrong. Received document is undefined`);
                        isFetching.current = false;
                        return;
                    }
                    //console.log("Recieved Score data: " + JSON.stringify(receivedDocument));
                    const compData: ScoreData = receivedDocument.score;
                    const document_title: string = receivedDocument.document_title;
                    const comments: Comment[] = receivedDocument.comments;
                    const metadata: DocumentMetadata = receivedDocument.metadata;
                    const tempDocument: Document = {
                        document_title: document_title,
                        comments: comments,
                        score: compData,
                        metadata: metadata,
                    };
                    setDocument(tempDocument);
                    if (notationRef.current) {
                        score.current?.loadScoreDataObj(compData);
                        score.current?.addNoteInMeasure([], 0);
                        console.log("LOADED SCORE DATA");
                        console.log("loaded Object: " + printScoreData(compData));
                        // Now add it to the currently selected note
                        if (selectedNoteId.current !== -1) {
                            d3.select(`[id="${selectedNoteId}"]`).classed('selected-note', true);
                        }
                        setNotationUpdated(prev => prev + 1);
                        createNewNoteBox();
                    }

                    // Update online users
                    const receivedUsers = (res.data as any)['onlineUsers'];
                    if (receivedUsers !== undefined) {
                        console.debug(`Received user data: ${JSON.stringify(receivedUsers)}`);
                        setOnlineUsers(new Map(Object.entries(receivedUsers)) as Map<string, OnlineEntity>);
                    } else {
                        console.error(`Something went wrong. Received online users is undefined`);
                    }

                    isFetching.current = false;
                });
        });
        // .catch((error) => {
        //         // Getting the Error details.
        //         const message = error.message;
        //         console.log(`Error: ${message}`);
        //         setIsFetching(false);
        //         return;
        //     });
    }

    // check if the user has edit access and update tools accordingly
    useEffect(() => {
        doesUserHaveEditAccess();
    }, []);

    const doesUserHaveEditAccess = async () => {
        // NOTE: documentId and userId are assumed to be set (but are probably not in reality) (move this code to somewhere where they are)
        const response = await callAPI("getUserAccessLevel", {
            userId: userId.current,
            documentId: documentID.current,
        });
        if (response.status !== 200) {
            console.error("Error fetching access level");
            return;
        }
        const accessLevel = response.data as number;

        console.log(`Access Level Response: ${accessLevel}`);
        const hasWriteAccess: boolean = accessLevel >= ShareStyle.WRITE;
        setHasWriteAccess(hasWriteAccess);
        if (accessLevel <= ShareStyle.NONE) {
            router.push(`/no_access`);
        }
        if (!hasWriteAccess && notationRef.current) {
            d3.select(notationRef.current)
                .on('click', null);
        }
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
    useInterval(() => {
        // Your custom logic here
        fetchChanges();
    }, 2000); // 5 seconds

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

        await callAPI("checkDocumentChanges", changesTemp)
            .then((res) => {
                if (res.status !== 200) {
                    console.log("Error fetching changes");
                    return;
                }
                const receivedDocument = (res.data as any)['document'];
                console.debug(`Received document data: ${JSON.stringify(receivedDocument)}`);

                const compData: ScoreData = receivedDocument.score;
                const document_title: string = receivedDocument.document_title;
                const comments: Comment[] = receivedDocument.comments;
                const metadata: DocumentMetadata = receivedDocument.metadata;
                const tempDocument: Document = {
                    document_title: document_title,
                    comments: comments,
                    score: compData,
                    metadata: metadata,
                };
                setDocument(tempDocument);

                // Update online users
                const receivedUsers = (res.data as any)['onlineUsers'];
                if (receivedUsers !== undefined) {

                    console.debug(`Received user data: ${JSON.stringify(receivedUsers)}`);
                    setOnlineUsers(new Map(Object.entries(receivedUsers)) as Map<string, OnlineEntity>);
                } else {
                    console.error(`Something went wrong. Received online users is undefined`);
                }
            }).catch((error) => {
                // Getting the Error details.
                const message = error.message;
                console.log(`Error: ${message}`);
                return;
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
            console.log("User Info: " + JSON.stringify(userInfo));

            callAPI("subscribeToDocument", userInfo)
                .then((res) => {
                    if (res.status != 200) {
                        console.log("Error fetching changes in handleScoreNameChange");
                        return;
                    }
                    // Read result of the Cloud Function.
                    const document = (res.data as any)['document'];
                    const compData: ScoreData = document.score;
                    const document_title: string = document.document_title;
                    const comments: Comment[] = document.comments;
                    const metadata: DocumentMetadata = document.metadata;
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
                })
                .catch((error) => {
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
            console.log(`Check Changes Input: ${JSON.stringify(changesTemp)}`);
            callAPI("checkDocumentChanges", changesTemp)
                .then((res) => {
                    if (res.status !== 200) {
                        console.log("Error fetching changes");
                        return;
                    }
                    const receivedDocument = (res.data as any)['document'];
                    console.debug(`Received document data: ${JSON.stringify(receivedDocument)}`);
                    const compData: ScoreData = receivedDocument.score;
                    const document_title: string = receivedDocument.document_title;
                    const comments: Comment[] = receivedDocument.comments;
                    const metadata: DocumentMetadata = receivedDocument.metadata;
                    const tempDocument: Document = {
                        document_title: document_title,
                        comments: comments,
                        score: compData,
                        metadata: metadata,
                    };
                    setDocument(tempDocument);

                    // Update online users
                    const receivedUsers = (res.data as any)['onlineUsers'];
                    if (receivedUsers !== undefined) {

                        console.debug(`Received user data: ${JSON.stringify(receivedUsers)}`);
                        setOnlineUsers(new Map(Object.entries(receivedUsers)) as Map<string, OnlineEntity>);
                    } else {
                        console.error(`Something went wrong. Received online users is undefined`);
                    }
                }).catch((error) => {
                    // Getting the Error details.
                    const message = error.message;
                    console.log(`Error: ${message}`);
                    return;
                });
        }, 1000);

        return function stopChecking() {
            clearInterval(intervalID);
        }
    }, [userTemp]);
    useEffect(() => {
        const svg = d3.select(notationRef.current).select('svg');

        svg.on('click', function (event) {
            const targetElement = event.target as HTMLElement;

            const noteheadElement = targetElement.closest('.vf-notehead');

            if (noteheadElement) {
                const noteHeadId = noteheadElement.getAttribute('id');
                let newSelectedNoteHeadId = '';
                if (noteHeadId) {
                    newSelectedNoteHeadId = noteHeadId;
                    setSelectedNoteHeadId(noteHeadId);
                }

                const stavenoteElement = noteheadElement.closest('.vf-stavenote') as HTMLElement;

                if (stavenoteElement) {
                    const stavenoteId = stavenoteElement.getAttribute('id');
                    let newSelectedNoteId = -1;
                    if (stavenoteId) {
                        newSelectedNoteId = parseInt(stavenoteId);
                        selectedNoteId.current = newSelectedNoteId;
                    }

                    // Call getKeyFromNoteHead with the new values
                    getKeyFromNoteHead(newSelectedNoteId, newSelectedNoteHeadId);
                } else {
                    console.warn('Parent vf-stavenote element not found');
                    selectedNoteId.current = -1;
                    setSelectedNoteHeadId('');
                    selectedKey.current = ''
                }
            } else {
                console.log('Clicked elsewhere');
                // Optionally reset selections
                selectedNoteId.current = -1;
                setSelectedNoteHeadId('');
                selectedKey.current = ''
            }
        });

        return () => {
            svg.on('click', null);
        };
    }, [notationRef.current]);


    // Gets the key of a note head
    const getKeyFromNoteHead = (noteId: number, noteHeadId: string) => {
        if (noteId !== -1 && noteHeadId !== '' && score.current) {
            const staveNote = score.current.findNote(noteId);

            if (staveNote) {
                const noteHeads = staveNote.noteHeads;
                const keys = staveNote.getKeys();

                for (let i = 0; i < noteHeads.length; i++) {
                    const noteHeadElement = noteHeads[i].getSVGElement();
                    const currentNoteHeadId = noteHeadElement?.getAttribute('id');
                    if (currentNoteHeadId === noteHeadId) {
                        const key = keys[i];
                        selectedKey.current = key;
                        return;
                    }
                }
                console.warn('Note head ID not found in staveNote.noteHeads');
                selectedKey.current = ''
            } else {
                //console.warn('StaveNote not found for selectedNoteId');
                selectedKey.current = ''
            }
        } else {
            console.warn('Setting selected key to an empty string');
            selectedKey.current = ''
        }
    };

    useEffect(() => {
        console.log(`selectedKey is: ${selectedKey}`);
    }, [selectedKey])

    useEffect(() => {
        // Clear existing highlighting
        d3.selectAll('.vf-notehead').classed('selected-note', false);
        d3.selectAll('.vf-stavenote').classed('selected-note', false);

        if (selectedNoteId !== null && selectedKey !== null && score.current) {
            const staveNote = score.current.findNote(selectedNoteId.current);
            createNewNoteBox();
            if (staveNote) {
                const keys = staveNote.getKeys();
                const noteHeads = staveNote.noteHeads;

                // Find the index of the selectedKey
                const index = keys.indexOf(selectedKey.current);

                if (index !== -1 && index < noteHeads.length) {
                    const noteHead = noteHeads[index];
                    const noteHeadId = noteHead.getAttribute('id');

                    if (noteHeadId) {
                        // Apply the 'selected-note' class to the notehead element
                        d3.select(`[id="vf-${noteHeadId}"]`).classed('selected-note', true);
                    }
                } else {
                    console.warn('Selected key not found in keys');
                }
            } else {
                //console.warn('StaveNote not found for selectedNoteId');
            }
        }

    }, [selectedNoteId, selectedKey.current, notationUpdated]);


    useEffect(() => {
        // // First remove the selectd note class from previously selected note
        // d3.selectAll('.vf-stavenote').classed('selected-note', false);

        // // Now add it to the currently selected note
        // if (selectedNoteId !== -1) {
        //     d3.select(`[id="${selectedNoteId}"]`).classed('selected-note', true);
        // }

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
                isTopNote = score.current.isTopMeasure(selectedNoteId.current);
            }
            const key = event.key.toLowerCase();
            const note = (isTopNote ? trebleKeyToNoteMap[key] : bassKeyToNoteMap[key]);

            // If a valid note was pressed and we have a note selected
            if (note && selectedNoteId.current !== -1) {
                addNoteHandler([note], selectedNoteId.current);
                selectedKey.current = note;
            }

            // // If we press the up arrow, raise the pitch
            // if (key === 'w') {
            //     const newNotes = increasePitch(score, selectedNoteId);
            //     const staveNote = score.current?.findNote(selectedNoteId);
            //     if (staveNote) {
            //         removeNoteHandler(staveNote.keys, selectedNoteId);
            //         addNoteHandler(newNotes, selectedNoteId);
            //         setNotationUpdated(prev => prev + 1);
            //     }
            // }
            // If we press the w key, raise the pitch
            if (key === 'w') {
                if (selectedNoteId !== null && selectedKey !== null) {
                    const staveNote = score.current?.findNote(selectedNoteId.current);
                    if (staveNote) {
                        let newSelectedKey = shiftNoteUp(selectedKey.current);
                        let secondToLastKey = selectedKey.current;
                        while (staveNote.getKeys().includes(newSelectedKey)) {
                            secondToLastKey = newSelectedKey;
                            newSelectedKey = shiftNoteUp(newSelectedKey);
                            if (secondToLastKey == newSelectedKey) break;
                        }
                        const newKeys = increasePitch(score, selectedNoteId.current, secondToLastKey);
                        selectedKey.current = newSelectedKey;
                        removeNoteHandler(staveNote.keys, selectedNoteId.current);
                        addNoteHandler(newKeys, selectedNoteId.current);
                        // Update selectedKey to the new pitch

                        setNotationUpdated(prev => prev + 1);
                    }
                }
            }


            // If we press the down arrow, lower the pitch
            if (key === 's') {
                if (selectedNoteId.current !== null && selectedKey !== null) {
                    const staveNote = score.current?.findNote(selectedNoteId.current);
                    if (staveNote) {
                        let newSelectedKey = shiftNoteDown(selectedKey.current);
                        let secondToLastKey = selectedKey.current;
                        while (staveNote.getKeys().includes(newSelectedKey)) {
                            secondToLastKey = newSelectedKey;
                            newSelectedKey = shiftNoteDown(newSelectedKey);
                            if (secondToLastKey == newSelectedKey) break;
                        }
                        const newKeys = lowerPitch(score, selectedNoteId.current, secondToLastKey);
                        selectedKey.current = newSelectedKey;
                        removeNoteHandler(staveNote.keys, selectedNoteId.current);
                        addNoteHandler(newKeys, selectedNoteId.current);
                        // Update selectedKey to the new pitch

                        setNotationUpdated(prev => prev + 1);
                    }
                }
            }

            // Remove a note if backspace if pressed
            if (key === 'backspace') {
                removeNoteHandler([''], selectedNoteId.current);
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
    }, [selectedNoteId.current]);

    const createNewNoteBox: CreateNewNoteBoxType = () => {
        if (!hasWriteAccess) return;
        if (!notationRef.current || !score.current) return;
        if (selectedNoteId.current === -1) return;
        let note = score.current?.findNote(selectedNoteId.current);
        let measure = score.current?.getMeasureFromNoteId(selectedNoteId.current);
        if (!note || !measure) return;

        notePlacementRectangleSVG.current?.remove();
        notePlacementRectangleSVG.current = createPlaceNoteBox(note);
        if (!notePlacementRectangleSVG.current) return;
        notationRef.current.querySelector("svg")?.appendChild(notePlacementRectangleSVG.current);
        notePlacementRectangleRef.current = d3.select(notePlacementRectangleSVG.current);

        let svgBoxY = notePlacementRectangleSVG.current.getBoundingClientRect().top + 10;
        attachMouseMoveListener(notePlacementRectangleRef.current, note, measure, svgBoxY, selectedKey.current);
        attachMouseLeaveListener(notePlacementRectangleRef.current, note, measure, selectedKey.current);
        selectedNoteId.current = (attachMouseClickListener(notePlacementRectangleRef.current, measure, score.current, sendChanges, selectedNoteId.current, svgBoxY, createNewNoteBox));
    }

    // Create PlaceNoteBox
    // useEffect (() => {
    //     createNewNoteBox();
    // }, [selectedNoteId]);

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
                    selectedNoteId.current = parseInt(selectId);
                }
            });

        // Clean up the event listener when notationRef unmounts
        return () => {
            d3.select(notationRef.current).on('click', null);
        }
    }, [notationRef.current])

    const updateUserCursor = async () => {
        if (selectedNoteId) {
            const cursor = {
                userID: userId.current,
                noteID: selectedNoteId.current, // Assuming you want to use the notehead's ID
                color: cursorColor.current,
            };

            const userInfo = {
                documentId: documentID.current,
                userId: userId.current,
                user_email: email.current,
                displayName: displayName.current,
                cursor: cursor // Send the SelectedNote object
            };

            callAPI("updateUserCursor", userInfo).then((res) => {
                if (res.status !== 200) {
                    console.log("Error updating user cursor: ", res.message);
                    return;
                }
            });
        }
    };

    const fetchDisplayName = async (userIdToFetch: string): Promise<string> => {
        if (displayNameCache.current[userIdToFetch]) {
            return displayNameCache.current[userIdToFetch];
        }
        try {
            const response = await callAPI('getUserFromId', { userId: userIdToFetch });
            if (response.status === 200 && response.data) {
                console.log(response.data);

                const displayName = (response.data as any)['display_name'];
                displayNameCache.current[userIdToFetch] = displayName;
                return displayName;
            } else {
                console.error(`Failed to fetch display name for userId ${userIdToFetch}`);
                return '';
            }
        } catch (error) {
            console.error(`Error fetching display name for userId ${userIdToFetch}:`, error);
            return '';
        }
    };

    useEffect(() => {
        // First, clear previous highlighting for other users
        d3.selectAll('.other-user-highlight').each(function () {
            d3.select(this).style('fill', null);
            d3.select(this).classed('other-user-highlight', false);
        });

        // Iterate over onlineUsers
        onlineUsers.forEach((onlineEntity, user_id) => {
            // Exclude the current user
            if (user_id !== userId.current) {
                const cursor = onlineEntity.cursor as SelectedNote;
                if (cursor && cursor.noteID && cursor.color) {
                    const noteHeadId = cursor.noteID;
                    const color = cursor.color;

                    // Select the notehead element by its CSS ID
                    const noteHeadElement = d3.select(`[id="${noteHeadId}"]`);
                    if (!noteHeadElement.empty()) {
                        noteHeadElement
                            .style('fill', color)
                            .classed('other-user-highlight', true);
                    } else {
                        console.warn(`Notehead with ID ${noteHeadId} not found`);
                    }
                }
            }
        });

        const updateUserList = async () => {
            console.log('Running updateUserList!');
            const users: { userId: string; displayName: string; color: string }[] = [];

            const promises = [];

            onlineUsers.forEach((onlineEntity, userIdKey) => {
                console.log(`Is ${userIdKey} !== ${userId.current}?`);
                if (userIdKey !== userId.current) {
                    const cursor = onlineEntity.cursor as SelectedNote;
                    if (cursor && cursor.color) {
                        const color = cursor.color;
                        const displayNamePromise = fetchDisplayName(userIdKey).then((displayName) => {
                            users.push({ userId: userIdKey, displayName, color });
                        });
                        promises.push(displayNamePromise);
                    }
                }
            });

            // await Promise.all(promises);
            // setUserList(users);
            userList.current = users;
        };


        updateUserList();
    }, [onlineUsers]);

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
                    documentMetadata={currentDocument.metadata}
                    modifyDurationInMeasure={modifyDurationHandler}
                    selectedNoteId={selectedNoteId.current}
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
                    removeAccidentals={removeAccidentalsHandler}
                    setKeySignature={setKeySignatureHandler}
                    handleDot={dotHandler}
                    hasWriteAccess={hasWriteAccess}
                    selectedKey={selectedKey.current}
                    userList={userList.current ? userList.current : []}
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
                    {/* <Button onClick={sendAndFetch}>fetch Score change</Button>  */}
                    <div>
                        <div ref={notationRef}></div>
                    </div>
                </Container>
            </AppShell.Main>
        </AppShell>
    );
}