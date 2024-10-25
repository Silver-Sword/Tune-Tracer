import { getDefaultMeasureData, MeasureData, printMeasureData } from './MeasureData';

export function getDefaultScoreData(): ScoreData
{
    return {
        title: "Untitled",
        topMeasures: [getDefaultMeasureData()],
        bottomMeasures: [getDefaultMeasureData()],
        ties: [],
        totalWidth: 325,
        rendererHeight: 2000,
        rendererWidth: 1000
    }
};

export function printScoreData(scoreData: ScoreData): string 
{
    let topMeasureString = "";
    scoreData.topMeasures.forEach((measure) => {
        topMeasureString += printMeasureData(measure) +"\n";
    });
    let bottomMeasureString = "";
    scoreData.bottomMeasures.forEach((measure) => {
        bottomMeasureString += printMeasureData(measure) +"\n";
    });
    
    return `
    Score Data:
        title: ${scoreData.title}
        ties: ${[...scoreData.ties]}
        total_width: ${scoreData.totalWidth}
        renderer_height: ${scoreData.rendererHeight}
        renderer_width: ${scoreData.rendererWidth},
        top measures------------ 
            ${topMeasureString},\n
        bottom measures------------  
            ${bottomMeasureString},\n
    `;
};

export type ScoreData = {
    title: string,
    topMeasures: MeasureData[],
    bottomMeasures: MeasureData[],
    ties: number[],
    totalWidth: number,
    rendererHeight: number,
    rendererWidth: number,
};
