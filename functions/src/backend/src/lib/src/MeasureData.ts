import { getDefaultStaveNoteData, StaveNoteData, printNoteData, getDefaultBottomStaveNoteData } from './StaveNoteData';

export function getDefaultMeasureData(): MeasureData
{
    return {
        x: 20,
        y: 0,
        width: 325,
        timeSignature: "4/4",
        keySignature: "C",
        clef: "treble",
        renderTimeSignature: false,
        notes: [getDefaultStaveNoteData(), getDefaultStaveNoteData(), getDefaultStaveNoteData(), getDefaultStaveNoteData()]
    }
};

export function getDefaultBottomMeasureData(): MeasureData
{   let data: MeasureData = getDefaultMeasureData();
    data.clef = "bass"
    data.notes = [getDefaultBottomStaveNoteData(), getDefaultBottomStaveNoteData(), getDefaultBottomStaveNoteData(), getDefaultBottomStaveNoteData()]
    return data
};

export function printMeasureData(measureData: MeasureData): string 
{
    let returnString = 
     `
     MeasureData:
        x: ${measureData.x}
        y: ${measureData.y}
        width: ${measureData.width}
        timeSignature: ${measureData.timeSignature},
        keySignature: ${measureData.keySignature},
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
    keySignature: string,
    clef: string,
    renderTimeSignature: boolean,
    notes: StaveNoteData[]
};
