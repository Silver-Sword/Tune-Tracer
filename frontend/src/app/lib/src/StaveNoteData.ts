export function getDefaultStaveNoteData(): StaveNoteData
{
    return {
        keys: ["b/4"],
        duration: "qr",
        dots: 0,
        modifiers: []
    }
};

export function getDefaultBottomStaveNoteData(): StaveNoteData
{
    return {
        keys: ["d/3"],
        duration: "qr",
        dots: 0,
        modifiers: []
    }
};

export function printNoteData(noteData: StaveNoteData): string 
{
    let modifierArray = "";
    noteData.modifiers.forEach((modifierData) => {
        modifierArray += `index: ${modifierData.index} `
        modifierArray += `modifier: ${modifierData.modifier}`
        modifierArray += "\n"
    });
    return `keys: ${noteData.keys} duration: ${noteData.duration}, dots: ${noteData.dots}, modifiers:
    ${modifierArray}`
}

export type ModifierData = {
    index: number,
    modifier: string
}

export type StaveNoteData = {
    keys: string[],
    duration: string,
    dots: number,
    modifiers: ModifierData[]
};
