// CRUD operations for notes

import { Score } from "../edit/Score";
import * as Tone from 'tone';

const keySignatureMap = new Map<string, { keys: Set<string>; allSharp: boolean }>([
    ["C", { keys: new Set(), allSharp: true }], // C Major - no sharps or flats
    ["G", { keys: new Set(["f"]), allSharp: true }], // G Major
    ["D", { keys: new Set(["f", "c"]), allSharp: true }], // D Major
    ["A", { keys: new Set(["f", "c", "g"]), allSharp: true }], // A Major
    ["E", { keys: new Set(["f", "c", "g", "d"]), allSharp: true }], // E Major
    ["B", { keys: new Set(["f", "c", "g", "d", "a"]), allSharp: true }], // B Major
    ["F#", { keys: new Set(["f", "c", "g", "d", "a", "e"]), allSharp: true }], // F# Major
    ["C#", { keys: new Set(["f", "c", "g", "d", "a", "e", "b"]), allSharp: true }], // C# Major
    ["Am", { keys: new Set(), allSharp: true }], // A Minor - relative to C Major
    ["Em", { keys: new Set(["f"]), allSharp: true }], // E Minor - relative to G Major
    ["Bm", { keys: new Set(["f", "c"]), allSharp: true }], // B Minor - relative to D Major
    ["F#m", { keys: new Set(["f", "c", "g"]), allSharp: true }], // F# Minor - relative to A Major
    ["C#m", { keys: new Set(["f", "c", "g", "d"]), allSharp: true }], // C# Minor - relative to E Major
    ["G#m", { keys: new Set(["f", "c", "g", "d", "a"]), allSharp: true }], // G# Minor - relative to B Major
    ["D#m", { keys: new Set(["f", "c", "g", "d", "a", "e"]), allSharp: true }], // D# Minor - relative to F# Major
    ["A#m", { keys: new Set(["f", "c", "g", "d", "a", "e", "b"]), allSharp: true }], // A# Minor - relative to C# Major
    ["F", { keys: new Set(["b"]), allSharp: false }], // F Major
    ["Bb", { keys: new Set(["b", "e"]), allSharp: false }], // Bb Major
    ["Eb", { keys: new Set(["b", "e", "a"]), allSharp: false }], // Eb Major
    ["Ab", { keys: new Set(["b", "e", "a", "d"]), allSharp: false }], // Ab Major
    ["Db", { keys: new Set(["b", "e", "a", "d", "g"]), allSharp: false }], // Db Major
    ["Gb", { keys: new Set(["b", "e", "a", "d", "g", "c"]), allSharp: false }], // Gb Major
    ["Cb", { keys: new Set(["b", "e", "a", "d", "g", "c", "f"]), allSharp: false }], // Cb Major
    ["Dm", { keys: new Set(["b"]), allSharp: false }], // D Minor - relative to F Major
    ["Gm", { keys: new Set(["b", "e"]), allSharp: false }], // G Minor - relative to Bb Major
    ["Cm", { keys: new Set(["b", "e", "a"]), allSharp: false }], // C Minor - relative to Eb Major
    ["Fm", { keys: new Set(["b", "e", "a", "d"]), allSharp: false }], // F Minor - relative to Ab Major
    ["Bbm", { keys: new Set(["b", "e", "a", "d", "g"]), allSharp: false }], // Bb Minor - relative to Db Major
    ["Ebm", { keys: new Set(["b", "e", "a", "d", "g", "c"]), allSharp: false }], // Eb Minor - relative to Gb Major
    ["Abm", { keys: new Set(["b", "e", "a", "d", "g", "c", "f"]), allSharp: false }], // Ab Minor - relative to Cb Major
]);



export const addNoteHandler = async (score: React.MutableRefObject<Score | null>, selectedNoteId: React.MutableRefObject<number>, notes: string[], noteId: number) => {
    if (score && score.current) {
        score.current.addNoteInMeasure(notes, noteId);
        selectedNoteId.current = noteId;
    }
}

export const removeNoteHandler = async (score: React.MutableRefObject<Score | null>, selectedNoteId: React.MutableRefObject<number>, keys: string[], noteId: number) => {
    if (score && score.current) {

        score.current.removeNote(keys, noteId);
        selectedNoteId.current = noteId;
    }
}

export const playNote = (note: string, piano: Tone.Sampler, keySig: string) => {
    const key = note.charAt(0);
    let noteToPlay;
    // Will replace with actual key sig later
    if (keySignatureMap.has(keySig) && keySignatureMap.get(keySig)?.keys.has(key)) {
        let modifier;
        if (keySignatureMap.get(keySig)?.allSharp) modifier = "#"
        else modifier = "b"
        noteToPlay = note.replace('/', modifier);
    }
    else {
        noteToPlay = note.replace('/', '');
    }
    piano.triggerAttackRelease(noteToPlay, "4n");
}