import { IconLetterA } from "@tabler/icons-react";
import { Score } from "../edit/Score";
import { Measure } from "../edit/Measure";
import * as d3 from 'd3';
import { Selection } from 'd3';
import { Vex, StaveNote, Formatter, Voice } from 'vexflow';
import { SendChangesType, CreateNewNoteBoxType } from "./CompositionTool";

const SNAP_INTERVAL = 5;

export function createPlaceNoteBox(note: StaveNote): SVGElement {
    // Add a custom SVG rectangle outline as an overlay
    let noteBox = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
    );
    noteBox.setAttribute("x", note.getBoundingBox().getX() + ""); // Position x-coordinate
    let stave = note.getStave();
    if (!stave) return noteBox;
    noteBox.setAttribute("y", (stave.getBoundingBox().getY() - 60) + ""); // Position y-coordinate
    noteBox.setAttribute("width", "20"); // Width of the rectangle
    noteBox.setAttribute("height", "250"); // Height of the rectangle
    noteBox.setAttribute("fill", "rgba(0, 0, 255, 0.0)"); // No fill color
    noteBox.setAttribute("stroke", "blue"); // Outline color
    noteBox.setAttribute("stroke-width", "2"); // Outline thickness

    return noteBox;
}

function getTrebleMap(): Map<number, string> {
    const map1 = new Map<number, string>();
    const notes1 = ["g", "f", "e", "d", "c", "b", "a"];
    let octave1 = 7;
    let interval1 = 1;

    for (let i = 0; i < 41; i++) {
        // 41 intervals from "g/7" to "d/2"
        const note = notes1[i % notes1.length];
        if (note === "b") {
            octave1--; // Decrease octave after reaching "b"
        }
        map1.set(interval1++, `${note}/${octave1}`);
    }
    return map1;
}

function getBassMap(): Map<number, string> {
    const map2 = new Map();
    const notes2 = ["b", "a", "g", "f", "e", "d", "c"];
    let octave2 = 5;
    let interval2 = 1;

    for (let i = 0; i < 48; i++) { // 48 intervals from "b/5" to "a/0"
        const note = notes2[i % notes2.length];
        map2.set(interval2++, `${note}/${octave2}`);

        if (note === "c") {
            octave2--; // Decrease octave after reaching "c"
        }
    }
    return map2;
}

function reAssignIds(voice: Voice, measure: Measure) {
    let tickables = voice.getTickables();
    for (let i = 0; i < tickables.length; i++) {
        let currentNote = tickables[i] as StaveNote;
        currentNote.getSVGElement()?.setAttribute('id', measure.ids[i] + "");
    }
}

function reAddSelectedClasses(newNote: StaveNote, selectedKey: string, addKey: string)
{
    let newNoteHeads = newNote.noteHeads;
        let newNotekeys = newNote.getKeys();
        for (let i = 0; i < newNoteHeads.length; i++) {
            if (newNotekeys[i] === selectedKey || newNotekeys[i] === addKey) {
                const noteHeadId = newNoteHeads[i].getAttribute('id');
                if (noteHeadId) {
                    // Apply the 'selected-note' class to the notehead element
                    d3.select(`[id="vf-${noteHeadId}"]`).classed('selected-note', true);
                }
            }
        }
}

export function attachMouseMoveListener(
    selection: Selection<SVGElement, unknown, null, undefined>, 
    note: StaveNote | null, 
    measure: Measure, 
    svgBoxY: number, 
    selectedKey: string) {
    let snapToKeyMap: Map<number, string>;
    if (measure.getClef() == "treble") {
        snapToKeyMap = getTrebleMap();
    }
    else {
        snapToKeyMap = getBassMap();
    }
    // Event listener for mouse move within the box
    selection.on("mousemove", async function (event) {
        if (note === null) return;

        const mouseY = event.clientY - svgBoxY;
        let stave = note.getStave();
        if (!stave) return;
        const snapIndex = Math.floor(mouseY / SNAP_INTERVAL);

        let keys = note.getKeys();
        let addKey = snapToKeyMap.get(snapIndex);
        if (addKey === undefined) return;

        let voice = measure.getVoice1();

        let newKeys;
        let includesKey = keys.includes(addKey);
        if (includesKey) {
            newKeys = note.getKeys();
        }
        else {
            if (note.isRest()) newKeys = [addKey];
            else newKeys = note.getKeys().concat(addKey);
        }
        //console.log("Add key: " + addKey);

        let newNote = new StaveNote({ clef: measure.getClef(), keys: newKeys, duration: measure.createDurationFromDots(note) });

        voice.setStave(stave);

        let context = note.getContext();

        let tickables = voice.getTickables();
        let newNotes: StaveNote[] = [];

        for (let i = 0; i < tickables.length; i++) {
            let currentNote = tickables[i] as StaveNote;
            if (currentNote.getAttribute('id') === note.getAttribute('id')) {
                newNotes.push(newNote);
            }
            else newNotes.push(currentNote);
            document.getElementById(measure.ids[i] + "")?.remove();
        }

        let newVoice = new Voice({ num_beats: measure.getCurrentBeats(), beat_value: measure.getCurrentBeatValue() }).addTickables(newNotes);

        new Formatter().formatToStave([newVoice], stave);
        // Render the voice
        newVoice.draw(context, stave);

        reAddSelectedClasses(newNote, selectedKey, addKey);

        reAssignIds(newVoice, measure);

    });
}

export function attachMouseLeaveListener(
    selection: Selection<SVGElement, unknown, null, undefined>, 
    note: StaveNote | null, 
    measure: Measure, 
    selectedKey: string) {
    // Event listener for mouse move within the box
    selection.on("mouseleave", async function (event) {
        if (note === null) return;

        let stave = note.getStave();
        if (!stave) return;

        let voice = measure.getVoice1();
        //console.log("Add key: " + addKey);

        voice.setStave(stave);

        let context = note.getContext();

        let tickables = voice.getTickables();
        let newNotes: StaveNote[] = [];

        for (let i = 0; i < tickables.length; i++) {
            let currentNote = tickables[i] as StaveNote;
            newNotes.push(currentNote);
            document.getElementById(measure.ids[i] + "")?.remove();
        }

        let newVoice = new Voice({ num_beats: measure.getCurrentBeats(), beat_value: measure.getCurrentBeatValue() }).addTickables(newNotes);

        new Formatter().formatToStave([newVoice], stave);
        // Render the voice
        newVoice.draw(context, stave);

        reAddSelectedClasses(note, selectedKey, "");

        reAssignIds(newVoice, measure);
    });
}

export function attachMouseClickListener(
    selection: Selection<SVGElement, unknown, null, undefined>,
    measure: Measure,
    score: Score,
    sendChanges: SendChangesType,
    selectedNoteId: number,
    svgBoxY: number,
    createNewNoteBox: CreateNewNoteBoxType): number {

    let snapToKeyMap: Map<number, string>;
    if (measure.getClef() == "treble") {
        snapToKeyMap = getTrebleMap();
    }
    else {
        snapToKeyMap = getBassMap();
    }
    // Event listener for mouse move within the box
    selection.on("click", async function (event) {
        const mouseY = event.clientY - svgBoxY;
        const snapIndex = Math.floor(mouseY / SNAP_INTERVAL);
        let addKey = snapToKeyMap.get(snapIndex);
        if (addKey === undefined) return;
        score.addNoteInMeasure([addKey], selectedNoteId);
        sendChanges();
        createNewNoteBox();
        let newNoteId = score.getAdjacentNote(selectedNoteId);
        return newNoteId;
    });
    return selectedNoteId;

}