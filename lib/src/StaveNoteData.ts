export function getDefaultStaveNoteData(): StaveNoteData
{
    return {
        keys: ["b/4"],
        duration: "qr",
        dots: 0
    }
};

export function printNoteData(noteData: StaveNoteData): string 
{
    return `keys: ${noteData.keys} duration: ${noteData.duration}, dots: ${noteData.dots}`
}

export type StaveNoteData = {
    keys: string[],
    duration: string
    dots: number
};
