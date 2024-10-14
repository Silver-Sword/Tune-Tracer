import { getDefaultStaveNoteData, StaveNoteData, printNoteData } from './StaveNoteData';

export function getDefaultMeasureData(): MeasureData
{
    return {
        x: 20,
        y: 0,
        width: 325,
        timeSignature: "4/4",
        clef: "treble",
        renderTimeSignature: false,
        notes: [getDefaultStaveNoteData(), getDefaultStaveNoteData(), getDefaultStaveNoteData(), getDefaultStaveNoteData()]
    }
};

export function printMeasureData(measureData: MeasureData): string 
{
    let returnString = 
     `
        x: ${measureData.x}
        y: ${measureData.y}
        width: ${measureData.width}
        timeSignature: ${measureData.timeSignature},
        clef: ${measureData.clef},
        renderTimeSignature: ${measureData.renderTimeSignature},
        notes:
    `;
    let noteString = "";
    measureData.notes.forEach((note) => {
        noteString += printNoteData(note) +"\n";
    })
    return returnString + noteString;
};

export type MeasureData = {
    x: number,
    y: number,
    width: number,
    timeSignature: string,
    clef: string,
    renderTimeSignature: boolean,
    notes: StaveNoteData[]
};
