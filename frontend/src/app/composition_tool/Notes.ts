// CRUD operations for notes

import { Score } from "../edit/Score";
import * as Tone from 'tone';

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

export const playNote = (note: string, piano: Tone.Sampler) => {
    const noteToPlay = note.replaceAll('/', '');
    piano.triggerAttackRelease(noteToPlay, "4n");
}

export const playNoteMouse = async (note: string) => {
    const noteToPlay = note.replaceAll('/', '');
    console.log(`Playing note ${note} with the mouse`);
    const piano = new Tone.Sampler({
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
        baseUrl: "/piano/"
    });
    await Tone.loaded();
    piano.triggerAttackRelease(noteToPlay, "4n");
}