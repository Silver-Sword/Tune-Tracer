// Given a note as a string ("C/4") it shifts it up to the next higher pitch
// E.g. C/4 -> D/4
import { Score } from "../edit/Score";

export const shiftNoteUp = (note: string) => {
    const noteSequence = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
    const [noteLetter, octave] = note.split('/');  // Example: 'C/4' -> 'C' and '4'
    let noteIndex = noteSequence.indexOf(noteLetter);
    let newOctave = parseInt(octave);

    // Move to the next note in the sequence
    if (noteIndex < noteSequence.length - 1) {
        noteIndex++;
    } else {
        // If the note is 'B', wrap around to 'C' and increase the octave
        noteIndex = 0;
        newOctave++;
    }

    // Return the new note and octave
    return `${noteSequence[noteIndex]}/${newOctave}`;
};

// Given a note as a string ("C/4") it shifts the note to the next lowest pitch
// E.g C/4 -> B/3
export const shiftNoteDown = (note: string) => {
    const noteSequence = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
    const [noteLetter, octave] = note.split('/');
    let noteIndex = noteSequence.indexOf(noteLetter);
    let newOctave = parseInt(octave);

    // Move to the previous note in the sequence
    if (noteIndex > 0) {
        noteIndex--;
    } else {
        // If the note is 'C', wrap around to 'B' and decrease the octave
        noteIndex = noteSequence.length - 1;
        newOctave--;
    }

    // Return the new note and octave
    return `${noteSequence[noteIndex]}/${newOctave}`;
};

// Increase the pitch of a note (or all notes in a given chord)
export const increasePitch = (score: React.MutableRefObject<Score | null>, selectedNoteId: number) => {
    // Get all the keys from the note passed in, raise all the pitches of them, return the new array
    const newNotes: string[] = [];
    if (score && score.current) {
        const staveNote = score.current.findNote(selectedNoteId);
        if (staveNote) {
            for (let i = 0; i < staveNote.keys.length; i++) {
                newNotes.push(shiftNoteUp(staveNote.keys[i]));
            }
        }
    }
    return newNotes;
}

// Decreaese the pitch of a note (or all notes in a given chord)
export const lowerPitch = (score: React.MutableRefObject<Score | null>, selectedNoteId: number) => {
    const newNotes: string[] = [];
    if (score && score.current) {
        const staveNote = score.current.findNote(selectedNoteId);
        if (staveNote) {
            for (let i = 0; i < staveNote.keys.length; i++) {
                newNotes.push(shiftNoteDown(staveNote.keys[i]))
            }
        }
    }
    return newNotes;
}