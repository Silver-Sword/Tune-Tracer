import { ModifierData } from '../../../../lib/src/StaveNoteData';
import { MeasureData } from '../../../../lib/src/MeasureData';
import { getDefaultScoreData, printScoreData, ScoreData } from '../../../../lib/src/ScoreData';

export function getScoreObj1(): ScoreData {
    return {
        title: "TestScore1",
        ties: [0],
        totalWidth: 345,
        rendererHeight: 2000,
        rendererWidth: 1000,
        topMeasures: getTopMeasuresObj1(),
        bottomMeasures: getBottomMeasuresObj1()
    }
}

export function getScoreDefaultObj(): ScoreData {
    return getDefaultScoreData();
}

function getTopMeasuresObj1(): MeasureData[] {
    let modifier1natural: ModifierData ={
        index: 0,
        modifier: 'n'
    }
    let measure1: MeasureData = {
        x: 20,
        y: 0,
        width: 325,
        timeSignature: "4/4",
        keySignature: "Bb",
        clef: "treble",
        renderTimeSignature: true,
        notes: [
            {
                keys: ["b/4", "d/4"],
                duration: "qd",
                dots: 1, modifiers: [modifier1natural]
            },
            {
                keys: ["b/4"],
                duration: "8r",
                dots: 0, modifiers: []
            },
            {
                keys: ["b/4"],
                duration: "qr",
                dots: 0, modifiers: []
            },
            {
                keys: ["b/4"],
                duration: "qr",
                dots: 0, modifiers: []
            }
        ]
    }
    let measure2: MeasureData = {
        x: 345,
        y: 0,
        width: 325,
        timeSignature: "4/4",
        keySignature: "Bb",
        clef: "treble",
        renderTimeSignature: false,
        notes: [
            {
                keys: ["b/4"],
                duration: "q",
                dots: 0, modifiers: []
            },
            {
                keys: ["b/4"],
                duration: "qr",
                dots: 0, modifiers: []
            },
            {
                keys: ["b/4"],
                duration: "qr",
                dots: 0, modifiers: []
            },
            {
                keys: ["b/4"],
                duration: "qr",
                dots: 0, modifiers: []
            }
        ]
    }
    let measure3: MeasureData = {
        x: 670,
        y: 0,
        width: 325,
        timeSignature: "4/4",
        keySignature: "Bb",
        clef: "treble",
        renderTimeSignature: false,
        notes: [
            {
                keys: ["b/4"],
                duration: "qr",
                dots: 0, modifiers: []
            },
            {
                keys: ["b/4"],
                duration: "qr",
                dots: 0, modifiers: []
            },
            {
                keys: ["b/4"],
                duration: "qr",
                dots: 0, modifiers: []
            },
            {
                keys: ["b/4"],
                duration: "qr",
                dots: 0, modifiers: []
            }
        ]
    }
    let measure4: MeasureData = {
        x: 20,
        y: 200,
        width: 325,
        timeSignature: "4/4",
        keySignature: "Bb",
        clef: "treble",
        renderTimeSignature: true,
        notes: [
            {
                keys: ["b/4"],
                duration: "qr",
                dots: 0, modifiers: []
            },
            {
                keys: ["b/4"],
                duration: "qr",
                dots: 0, modifiers: []
            },
            {
                keys: ["b/4"],
                duration: "qr",
                dots: 0, modifiers: []
            },
            {
                keys: ["b/4"],
                duration: "qr",
                dots: 0, modifiers: []
            }
        ]
    }
    let returnData: MeasureData[] = [measure1,measure2,measure3,measure4];
    return returnData;
}

function getBottomMeasuresObj1(): MeasureData[] {
    let measure1: MeasureData = {
        x: 20,
        y: 0,
        width: 325,
        timeSignature: "4/4",
        keySignature: "Bb",
        clef: "bass",
        renderTimeSignature: true,
        notes: [
            {
                keys: ["d/3", "b/4"],
                duration: "h",
                dots: 0, modifiers: []
            },
            {
                keys: ["d/3"],
                duration: "hr",
                dots: 0, modifiers: []
            }
        ]
    }
    let measure2: MeasureData = {
        x: 345,
        y: 0,
        width: 325,
        timeSignature: "4/4",
        keySignature: "Bb",
        clef: "bass",
        renderTimeSignature: false,
        notes: [
            {
                keys: ["d/3"],
                duration: "qr",
                dots: 0, modifiers: []
            },
            {
                keys: ["d/3"],
                duration: "qr",
                dots: 0, modifiers: []
            },
            {
                keys: ["d/3"],
                duration: "qr",
                dots: 0, modifiers: []
            },
            {
                keys: ["d/3"],
                duration: "qr",
                dots: 0, modifiers: []
            }
        ]
    }
    let measure3: MeasureData = {
        x: 670,
        y: 0,
        width: 325,
        timeSignature: "4/4",
        keySignature: "Bb",
        clef: "bass",
        renderTimeSignature: false,
        notes: [
            {
                keys: ["d/3"],
                duration: "qr",
                dots: 0, modifiers: []
            },
            {
                keys: ["d/3"],
                duration: "qr",
                dots: 0, modifiers: []
            },
            {
                keys: ["d/3"],
                duration: "qr",
                dots: 0, modifiers: []
            },
            {
                keys: ["d/3"],
                duration: "qr",
                dots: 0, modifiers: []
            }
        ]
    }
    let measure4: MeasureData = {
        x: 20,
        y: 0,
        width: 325,
        timeSignature: "4/4",
        keySignature: "Bb",
        clef: "bass",
        renderTimeSignature: true,
        notes: [
            {
                keys: ["d/3"],
                duration: "qr",
                dots: 0,
                modifiers: []
            },
            {
                keys: ["d/3"],
                duration: "qr",
                dots: 0,
                modifiers: []
            },
            {
                keys: ["d/3"],
                duration: "qr",
                dots: 0,
                modifiers: []
            },
            {
                keys: ["d/3"],
                duration: "qr",
                dots: 0,
                modifiers: []
            }
        ]
    }
    let returnData: MeasureData[] = [measure1,measure2,measure3,measure4];
    return returnData;
}


// export function getScoreObj2(): ScoreData {
//     return {
//         ties: [1,9],
//         totalWidth: 345,
//         rendererHeight: 2000,
//         rendererWidth: 1000,
//         topMeasures: getTopMeasuresObj2(),


//     }
// }

// function getTopMeasuresObj2(): MeasureData[] {
//     let measure1: MeasureData = {
//         x: 20,
//         y: 0,
//         width: 325,
//         timeSignature: "4/4",
//         clef: "treble",
//         renderTimeSignature: true,
//         notes: [
//             {
//                 keys: ["c/4","g/4"],
//                 duration: "8",
//                 dots: 0
//             },
//             {
//                 keys: ["c/4","g/4"],
//                 duration: "16",
//                 dots: 0
//             },
//             {
//                 keys: ["c/4,g/4"],
//                 duration: "q",
//                 dots: 2
//             },
//             {
//                 keys: ["d/4"],
//                 duration: "qd",
//                 dots: 1
//             },
//             {
//                 keys: ["b/4"],
//                 duration: "8r",
//                 dots: 0
//             }
//         ]
//     }
//     let measure2: MeasureData = {
//         x: 20,
//         y: 0,
//         width: 325,
//         timeSignature: "4/4",
//         clef: "treble",
//         renderTimeSignature: false,
//         notes: [
//             {
//                 keys: ["c/4","g/4"],
//                 duration: "q",
//                 dots: 0
//             },
//             {
//                 keys: ["c/4","g/4"],
//                 duration: "q",
//                 dots: 0
//             },
//             {
//                 keys: ["b/4"],
//                 duration: "qr",
//                 dots: 0
//             },
//             {
//                 keys: ["b/4"],
//                 duration: "qr",
//                 dots: 0
//             }
//         ]
//     }
//     let measure3: MeasureData = {
//         x: 20,
//         y: 0,
//         width: 325,
//         timeSignature: "4/4",
//         clef: "treble",
//         renderTimeSignature: false,
//         notes: [
//             {
//                 keys: ["c/4","g/4"],
//                 duration: "q",
//                 dots: 0
//             },
//             {
//                 keys: ["c/4","g/4"],
//                 duration: "q",
//                 dots: 0
//             },
//             {
//                 keys: ["b/4"],
//                 duration: "qr",
//                 dots: 0
//             },
//             {
//                 keys: ["b/4"],
//                 duration: "qr",
//                 dots: 0
//             }
//         ]
//     }
//     return {
//     }
// }