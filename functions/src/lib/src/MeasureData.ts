export function getDefaultMeasureData(): MeasureData
{
    return {
        num_beats: 0,
        beat_value: 0,
        total_ticks: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        timeSignature: "",
        clef: "",
        rest_location: "",
    }
};

export type MeasureData = {
    num_beats: number,
    beat_value: number,
    total_ticks: number,
    width: number,
    height: number,
    x: number,
    y: number,
    timeSignature: string,
    clef: string,
    rest_location: string,
};
