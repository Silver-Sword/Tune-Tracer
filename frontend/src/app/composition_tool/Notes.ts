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