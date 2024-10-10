import { getDefaultStaveNoteData, StaveNoteData } from './StaveNoteData';

export function getDefaultMeasureData(): MeasureData
{
    return {
        x: 0,
        y: 0,
        width: 0,
        timeSignature: "",
        clef: "",
        renderTimeSignature: false,
        notes: []
    }
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
