import { getDefaultMeasureData, MeasureData } from './Measure';

type ScoreData = {
    top_measures: MeasureData[];
    bottom_measures: MeasureData[];  // both are equal in length
    // Will most definitely need to add more objects here, but it depends on some factors
};

export type CompositionData =
{
    composition_title: string,       // the title of the composition; the label of the document used on the storage page
    composer_name: string,
    tempo: number,
    contents: ScoreData,             // the contents of the composition
};

// returns a "blank" CompositionData object
export function getDefaultCompositionData(): CompositionData
{
    return {
        composition_title: "",
        composer_name: "",
        tempo: 0,
        contents: getDefaultScoreData() 
    };
}

// returns a "blank" ScoreData object
export function getDefaultScoreData(): ScoreData
{
    return {
        top_measures: [getDefaultMeasureData()],
        bottom_measures: [getDefaultMeasureData()],
    };
}