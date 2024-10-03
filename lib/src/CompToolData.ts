import { Measure } from '../../frontend/src/app/edit/Measure';

type ScoreData = {
    top_measures: Measure[];
    bottom_measures: Measure[];  // both are equal in length
    // Will most definitely need to add more objects here, but it depends on some factors
};

export type CompositionData =
{
    composition_title: string,       // the title of the composition; the label of the document used on the storage page
    composer_name: string,
    tempo: number,
    contents: ScoreData,             // the contents of the composition
};
