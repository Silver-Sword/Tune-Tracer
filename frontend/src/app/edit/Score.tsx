import { Vex, Formatter, StaveNote, StaveTie, Beam, Tickable } from 'vexflow';
import { Measure } from './Measure';
import { render } from '@testing-library/react';
import { MeasureData } from '../../../../lib/src/MeasureData';
import { getDefaultScoreData, printScoreData, ScoreData } from '../../../../lib/src/ScoreData';

type RenderContext = InstanceType<typeof Vex.Flow.RenderContext>;

const DEFAULT_MEASURE_VERTICAL_SPACING = 100;
const DEFAULT_NOTE_PADDING_FROM_TOP = 10;
const DEFAULT_PADDING_IN_BETWEEN_MEASURES = 50;


const DEFAULT_FIRST_MEASURES_X = 20;
const DEFAULT_FIRST_MEASURES_Y = 0;

const DEFAULT_MEASURE_WIDTH = 325;
const DEFAULT_SPACING_BETWEEN_LINES_OF_MEASURES = 200;



class SortKeyObj {
    public key: string;
    public int_value: number | undefined;

    constructor(key: string, int_value: number | undefined) {
        this.key = key;
        this.int_value = int_value;
    }
}

export class Score {
    private VF = Vex.Flow;
    private top_measures: Measure[] = [];
    private bottom_measures: Measure[] = [];  // both are equal in length
    private ties: Set<number> = new Set<number>();
    private context: RenderContext;
    private total_width: number = 0;
    private renderer_height = 0;
    private renderer_width = 0;
    private ID_to_MeasureIndexID: Map<number, { measureIndex: number, noteId: string, topMeasure: boolean }> = new Map();
    private key_signature = "C";
    constructor(
        notationRef: HTMLDivElement,
        rendererHeight: number,
        rendererWidth: number,
        timeSignature: string = "4/4",
        keySignature: string = "C",
        scoreData?: ScoreData
    ) {
        this.total_width += DEFAULT_MEASURE_WIDTH + DEFAULT_FIRST_MEASURES_X;
        if (scoreData !== undefined) {
            rendererHeight = scoreData.rendererHeight;
            rendererWidth = scoreData.rendererWidth;
            this.total_width = scoreData.totalWidth;
        }

        this.renderer_height = rendererHeight;
        this.renderer_width = rendererWidth;
        this.key_signature = keySignature;

        const renderer = new this.VF.Renderer(notationRef, this.VF.Renderer.Backends.SVG);
        renderer.resize(this.renderer_width, this.renderer_height);
        this.context = renderer.getContext();
        if (scoreData !== undefined) {
            this.ties = new Set<number>(scoreData.ties);
            scoreData.topMeasures.forEach((topMeasure) => {
                this.top_measures.push(new Measure(undefined, undefined, undefined, undefined, undefined, undefined, undefined, topMeasure));
            });

            scoreData.bottomMeasures.forEach((bottomMeasure) => {
                this.bottom_measures.push(new Measure(undefined, undefined, undefined, undefined, undefined, undefined, undefined, bottomMeasure));
            });
        }
        else {
            const firstTopMeasure = new Measure(
                DEFAULT_FIRST_MEASURES_X, 
                DEFAULT_FIRST_MEASURES_Y, 
                DEFAULT_MEASURE_WIDTH, timeSignature, "treble", true, this.key_signature);
            // X and Y don't matter here because bottom measure always adjusts based on top measure
            const firstBottomMeasure = new Measure(
                DEFAULT_FIRST_MEASURES_X, 
                DEFAULT_FIRST_MEASURES_Y + DEFAULT_MEASURE_VERTICAL_SPACING, 
                DEFAULT_MEASURE_WIDTH, timeSignature, "bass", true, this.key_signature);
            this.top_measures.push(firstTopMeasure);
            this.bottom_measures.push(firstBottomMeasure);
        }


        this.renderMeasures();
    }

    exportScoreDataObj = (): ScoreData => {
        let scoreData: ScoreData = getDefaultScoreData();
        scoreData.rendererHeight = this.renderer_height;
        scoreData.rendererWidth = this.renderer_width;
        scoreData.totalWidth = this.total_width;
        scoreData.ties = Array.from(this.ties);

        let topMeasures: MeasureData[] = [];
        this.top_measures.forEach((topMeasure) => {
            topMeasures.push(topMeasure.exportMeasureDataObj());
        });

        let bottomMeasures: MeasureData[] = [];
        this.bottom_measures.forEach((bottomMeasure) => {
            bottomMeasures.push(bottomMeasure.exportMeasureDataObj());
        });

        scoreData.topMeasures = topMeasures;
        scoreData.bottomMeasures = bottomMeasures;

        console.log(printScoreData(scoreData));
        return scoreData;

    }

    addNoteInMeasure = (
        keys: string[],
        noteId: number
    ): void => {
        let measureIndex = this.ID_to_MeasureIndexID.get(noteId)?.measureIndex;
        let noteIdStr = this.ID_to_MeasureIndexID.get(noteId)?.noteId;
        if (measureIndex == undefined || noteIdStr == undefined) return;
        // Return new ID of note instead of boolean
        // Use that ID to record whether that staveNote has a Tie
        // If we ever see the ID get a note added to it, update its ID
        // Then add a Tie using the new ID
        // Change tie logic to take only one note
        // At render time, clean obselete ties
        let newNote: StaveNote | null = null;
        newNote = this.top_measures[measureIndex].addNote(keys, noteIdStr);
        if (newNote == null) {
            newNote = this.bottom_measures[measureIndex].addNote(keys, noteIdStr)
        }

        this.renderMeasures();
        newNote?.getSVGElement()?.setAttribute('id', "1420");
    }

    removeNote = (
        keys: string[],
        noteId: number
    ): void => {
        let measureIndex = this.ID_to_MeasureIndexID.get(noteId)?.measureIndex;
        let noteIdStr = this.ID_to_MeasureIndexID.get(noteId)?.noteId;
        if (measureIndex == undefined || noteIdStr == undefined) return;
        // Return new ID of note instead of boolean
        // Use that ID to record whether that staveNote has a Tie
        // If we ever see the ID get a note added to it, update its ID
        // Then add a Tie using the new ID
        // Change tie logic to take only one note
        // At render time, clean obselete ties
        let newNote: { staveNote: StaveNote | null, found: boolean };
        newNote = this.top_measures[measureIndex].removeNote(keys, noteIdStr);
        if (newNote.found === false) {
            newNote = this.bottom_measures[measureIndex].removeNote(keys, noteIdStr)
        }

        this.renderMeasures();
    }

    // This method sorts keys by vertical height. Vexflow does this internally but doesn't expose
    // its sorted keys for SOME reason so we have to manually sort here to properly map ties.
    private sortKeys = (note: StaveNote): string[] => {
        let keyProps = note.getKeyProps();
        let keys = note.getKeys();
        let keyObjs: SortKeyObj[] = [];
        // Associate int_value with key value
        for (let i = 0; i < keys.length; i++) {
            keyObjs.push(new SortKeyObj(keys[i], keyProps[i].int_value));
        }

        let sortedKeys: string[] = [];
        // Sort based on int value
        keyObjs.sort((a, b) => {
            if (!(a.int_value && b.int_value)) return 0;
            return a.int_value - b.int_value;
        })
        // Add to the sorted keys array
        keyObjs.forEach(element => {
            sortedKeys.push(element.key);
        });
        return keys;
    }

    addTie = (noteId: number): void => {
        this.ties.add(noteId);
        this.renderMeasures();
    }

    removeTie = (noteId: number): void => {
        this.ties.delete(noteId);
        this.renderMeasures();
    }

    getAdjacentNote = (noteId: number): number => {
        let measureIndex1 = this.ID_to_MeasureIndexID.get(noteId)?.measureIndex;
        let topMeasure = this.ID_to_MeasureIndexID.get(noteId)?.topMeasure;
        if (measureIndex1 == null) return noteId;
        let measureIndex2 = this.ID_to_MeasureIndexID.get(noteId + 1)?.measureIndex;
        if (measureIndex2 == null) return noteId;

        if (measureIndex1 !== measureIndex2) {
            if (topMeasure) {
                return noteId + this.bottom_measures[measureIndex1].getVoice1().getTickables().length;
            }
            else {
                // We know measureIndex1 + 1 
                return noteId + this.top_measures[measureIndex1 + 1].getVoice1().getTickables().length;
            }
        }
        return noteId + 1;
    }


    modifyDurationInMeasure = (
        duration: string,
        noteId: number
    ): void => {
        let measureIndex = this.ID_to_MeasureIndexID.get(noteId)?.measureIndex;
        let noteIdStr = this.ID_to_MeasureIndexID.get(noteId)?.noteId;
        if (measureIndex == undefined || noteIdStr == undefined) return;

        let found: boolean = this.top_measures[measureIndex].modifyDuration(duration, noteIdStr);
        if (!found) {
            found = this.bottom_measures[measureIndex].modifyDuration(duration, noteIdStr)
        }
        if (found) {
            console.log(this.ties);
            // Remove ties associated with noteId
            if (this.ties.has(noteId)) this.ties.delete(noteId);
        }
        this.renderMeasures();
    }

    addMeasure = (): void => {
        // First get all the information from the previous measure as a baseline
        let topPrevMeasure: Measure = this.top_measures[this.top_measures.length - 1];
        let topX = topPrevMeasure.getStave().getX() + DEFAULT_MEASURE_WIDTH;
        let topY = topPrevMeasure.getStave().getY();
        let topTimeSignature = topPrevMeasure.getTimeSignature();
        let topClef = topPrevMeasure.getClef();
        let renderTopTimeSig = false;

        let bottomPrevMeasure: Measure = this.bottom_measures[this.bottom_measures.length - 1];
        let bottomX = bottomPrevMeasure.getStave().getX() + DEFAULT_MEASURE_WIDTH;
        let bottomY = bottomPrevMeasure.getStave().getY();
        let bottomTimeSignature = bottomPrevMeasure.getTimeSignature();
        let bottomClef = bottomPrevMeasure.getClef();
        let renderBottomTimeSig = false;

        // If this next measure will go out of bounds...
        if (this.total_width + DEFAULT_MEASURE_WIDTH > this.renderer_width) {
            // Then put the next measures on the next 'measure line' 

            topX = DEFAULT_FIRST_MEASURES_X;
            // Render Measures will take care of properly pushing this down 
            // based on the bottom measure's bounding box when formatted to Stave
            topY += DEFAULT_SPACING_BETWEEN_LINES_OF_MEASURES;
            renderTopTimeSig = true;

            bottomX = DEFAULT_FIRST_MEASURES_X;
            bottomY = topY + DEFAULT_MEASURE_VERTICAL_SPACING;
            renderBottomTimeSig = true;

            this.total_width = DEFAULT_FIRST_MEASURES_X;

        }

        this.total_width += DEFAULT_MEASURE_WIDTH;

        const newTopMeasure = new Measure(topX, topY, DEFAULT_MEASURE_WIDTH, topTimeSignature, topClef, renderTopTimeSig, this.key_signature);
        const newBottomMeasure = new Measure(bottomX, bottomY, DEFAULT_MEASURE_WIDTH, bottomTimeSignature, bottomClef, renderBottomTimeSig, this.key_signature);
        this.top_measures.push(newTopMeasure);
        this.bottom_measures.push(newBottomMeasure);
        this.renderMeasures();
    }

    private generateBeams = (measure: Measure) => {
        const beams = Beam.generateBeams(measure.getVoice1().getTickables() as StaveNote[]);
        beams.forEach((b) => {
            b.setContext(this.context).draw();
        });
    }

    private giveIDs = (tickables: Tickable[], measureIndex: number, IDCounter: number, topMeasure: boolean) => {
        tickables.forEach(tickable => {
            let staveNote = tickable as StaveNote;
            staveNote.getSVGElement()?.setAttribute('id', IDCounter + "");
            // We map our generated ID to the ID vexflow generates. This is because we don't have access to the SVG ID before note is drawn
            // Before the note is drawn, we need a way to reference that. 
            // Instead of re-inventing the wheel, I'm mapping new IDs to old IDs to not mess with logic
            // This means we can reference notes with new ID, but under the hood its still using old logic
            this.ID_to_MeasureIndexID.set(IDCounter, { measureIndex, noteId: staveNote.getAttributes().id, topMeasure });
            IDCounter++;
        });
        return IDCounter;
    }

    private renderMeasureLine = (topMeasures: Measure[], bottomMeasures: Measure[], topMeasureDeltaDown: number, bottomMeasureDeltaDown: number) => {
        for (let i = 0; i < topMeasures.length; i++) {
            let topMeasure = topMeasures[i];
            let bottomMeasure = bottomMeasures[i];
            let topStave = topMeasure.getStave();
            let bottomStave = bottomMeasure.getStave();

            topStave.setY(topStave.getY() + topMeasureDeltaDown);

            bottomStave.setY(bottomStave.getY() + bottomMeasureDeltaDown);
            topStave.setContext(this.context).draw();
            bottomStave.setContext(this.context).draw();

            if (i == 0) {
                // Create the brace and connect the staves
                const brace = new this.VF.StaveConnector(topStave, bottomStave);
                brace.setType(this.VF.StaveConnector.type.BRACE);
                brace.setContext(this.context).draw();
            }


            // Create the left line to connect the staves
            const lineLeft = new this.VF.StaveConnector(topStave, bottomStave);
            lineLeft.setType(this.VF.StaveConnector.type.SINGLE_LEFT);
            lineLeft.setContext(this.context).draw();

            // Create the right line to connect the staves
            const lineRight = new this.VF.StaveConnector(topStave, bottomStave);
            lineRight.setType(this.VF.StaveConnector.type.SINGLE_RIGHT);
            lineRight.setContext(this.context).draw();
            // Vexflow can auto generate beams for us so we can render them here
            this.generateBeams(topMeasure);
            this.generateBeams(bottomMeasure);

            // With Beams in place we can draw voices
            topMeasure.getVoice1().draw(this.context, topStave);
            bottomMeasure.getVoice1().draw(this.context, bottomStave);
        }
    }

    private calculateMeasureLine = (topMeasures: Measure[], bottomMeasures: Measure[], formatter: Formatter, ceiling: number): number => {
        // We want to know the largest bounding box in this line of measures
        // We'll use its coordinates to space all measures in the line
        let largestTopMeasureBoundingBoxY: number = 0;
        let largestBottomMeasureBoundingBoxY: number = 0;
        let largestTopMeasureBoundingBoxH: number = 0;
        let largestBottomMeasureBoundingBoxH: number = 0;

        for (let i = 0; i < topMeasures.length; i++) {
            let topMeasure = topMeasures[i];
            let bottomMeasure = bottomMeasures[i];
            let topStave = topMeasure.getStave();
            let bottomStave = bottomMeasure.getStave();

            const topVoice1 = topMeasure.getVoice1();
            const bottomVoice1 = bottomMeasure.getVoice1();

            topVoice1.setStave(topStave);
            bottomVoice1.setStave(bottomStave);

            formatter.formatToStave([topVoice1], topStave);
            formatter.formatToStave([bottomVoice1], bottomStave);

            const topBoundingBox = topVoice1.getBoundingBox();
            const bottomBoundingBox = bottomVoice1.getBoundingBox();

            if (topBoundingBox == null || bottomBoundingBox == null) {
                console.error("topBoundingBox is NULL");
                return -1;
            }

            const topBoundingBoxTopY: number = topBoundingBox.getY();
            const topBoundingBoxH = topBoundingBox.getH();

            const bottomBoundingBoxTopY: number = bottomBoundingBox.getY();
            const bottomBoundingBoxH = bottomBoundingBox.getH();

            if (i == 0) {
                largestTopMeasureBoundingBoxY = topBoundingBoxTopY;
                largestTopMeasureBoundingBoxH = topBoundingBox.getH();
                largestBottomMeasureBoundingBoxY = bottomBoundingBoxTopY;
                largestBottomMeasureBoundingBoxH = bottomBoundingBox.getH();
            }
            if (topBoundingBoxH > largestTopMeasureBoundingBoxH) {
                largestTopMeasureBoundingBoxY = topBoundingBoxTopY;
                largestTopMeasureBoundingBoxH = topBoundingBox.getH();
            }
            if (bottomBoundingBoxH > largestBottomMeasureBoundingBoxH) {
                largestBottomMeasureBoundingBoxY = bottomBoundingBoxTopY;
                largestBottomMeasureBoundingBoxH = bottomBoundingBox.getH();
            }

        }
        // Figure out the Y values for the Top measure and bottom measure
        // For now, we'll just figure out deltas for the measures

        let topMeasureDeltaDown = 0;

        if (largestTopMeasureBoundingBoxY < ceiling) {
            // Difference between ceiling and top part of bounding box
            topMeasureDeltaDown = ceiling - largestTopMeasureBoundingBoxY;
            // Update our bounding box Y value as this delta changes it
            largestTopMeasureBoundingBoxY += topMeasureDeltaDown;
        }

        let largestTopMeasureBoundingBoxBottomY: number = largestTopMeasureBoundingBoxY + largestTopMeasureBoundingBoxH;


        let bottomMeasureDeltaDown: number = 0;

        // This means there is overlap between the bottom bounding box and the top bounding box
        if (largestBottomMeasureBoundingBoxY < largestTopMeasureBoundingBoxBottomY) {
            // Delta should be the difference 
            bottomMeasureDeltaDown = DEFAULT_PADDING_IN_BETWEEN_MEASURES + (largestTopMeasureBoundingBoxBottomY - largestBottomMeasureBoundingBoxY);
            // Update our bounding box Y value as this delta changes it
            largestBottomMeasureBoundingBoxY += bottomMeasureDeltaDown;
        }

        let largestBottomMeasureBoundingBoxBottomY: number = largestBottomMeasureBoundingBoxY + largestBottomMeasureBoundingBoxH;

        this.renderMeasureLine(topMeasures, bottomMeasures, topMeasureDeltaDown, bottomMeasureDeltaDown);
        return largestBottomMeasureBoundingBoxBottomY;
    }

    // If you want to connect a tie to the end of the measure, repeat the indices for which the notes match: 
    //first_indices: [0,1],    // Tie on the first note (single note)
    //last_indices: [0,1]      // Tie on the second note
    //  Then just include the stavenote that is connecting to the end (first note will connect to end of measure, second to start)
    // If on same measure, then connect the indices such that the pitch is preserved
    private createTies = (firstNote: StaveNote | undefined, secondNote: StaveNote | undefined): boolean => {
        if (firstNote === undefined || secondNote === undefined) return false;
        // Get keys sorted by their vertical position
        const firstNoteSortedKeys = this.sortKeys(firstNote);
        const secondNoteKeys = this.sortKeys(secondNote);

        // We need to map keys to their vertical index position (they are sorted by vertical position so array index == vertical position)
        const secondNoteKeyMap = new Map<string, number>();
        secondNoteKeys.forEach((key, index) => {
            secondNoteKeyMap.set(key, index);
        });

        // These arrays will be the ones used when creating the ties. They specify the vertical index of the note that should be attached to another
        // the notes that are going to be attached need to maintain the same pitch
        let matchedFirstNoteKeyIndices: number[] = [];
        let matchedSecondNoteKeyIndices: number[] = [];

        let sameYCoords: boolean = false;

        // MatchedKeys will store the index of the matching keys present in both StaveNotes
        // Run thru the first set of keys, and if the second set of keys has it, 
        // store the vertical index for which the key occurs for both StaveNotes
        firstNoteSortedKeys.forEach((key, index) => {
            if (secondNoteKeyMap.has(key)) {
                matchedFirstNoteKeyIndices.push(index);
                // find the index for which the key occurs for the second note
                let secondIndex: number | undefined = secondNoteKeyMap.get(key);
                if (secondIndex == undefined) return;
                matchedSecondNoteKeyIndices.push(secondIndex);
                // If both staveNotes have the same key, cool we can make a tie
                // However, for rendering, we need to see if the StaveNotes are on a different
                // line of measures
                if (!sameYCoords) {
                    sameYCoords = firstNote.getYs()[index] == secondNote.getYs()[secondIndex];
                }
            }
        });

        // If its in the same measure, then we connect the tie between the two notes in the measure
        if (sameYCoords) {
            let tie = new StaveTie({
                first_note: firstNote,
                last_note: secondNote,
                first_indices: matchedFirstNoteKeyIndices,
                last_indices: matchedSecondNoteKeyIndices,
            });
            // Draw the curve
            tie.setContext(this.context).draw();
        }
        // Else, we'll want to make two separate tie objects,
        //the first that connects the first note to the END of ITS measure, 
        // and then another object that connects the START of the SECOND NOTE'S measure to the second note
        else {
            let tie1 = new StaveTie({
                first_note: firstNote,
                last_note: undefined,
                first_indices: matchedFirstNoteKeyIndices,
                last_indices: matchedSecondNoteKeyIndices,
            });
            let tie2 = new StaveTie({
                first_note: undefined,
                last_note: secondNote,
                first_indices: matchedFirstNoteKeyIndices,
                last_indices: matchedSecondNoteKeyIndices,
            });
            tie1.setContext(this.context).draw();
            tie2.setContext(this.context).draw();
        }
        // If no matched keys, invalid tie
        return !(matchedFirstNoteKeyIndices.length == 0);
    }

    private searchForNotePairs = (noteId: string, measureIndex: number, top: boolean): { firstNote: StaveNote, secondNote: StaveNote | null } | null => {
        if (top) {
            return this.top_measures[measureIndex].getStaveNotePair(noteId);
        }
        else {
            return this.bottom_measures[measureIndex].getStaveNotePair(noteId);
        }
    }

    private getFirstNoteInMeasure = (measureIndex: number, top: boolean): StaveNote | null => {
        // Measure counts are same for top and bottom
        if (measureIndex >= this.top_measures.length) return null;
        if (top) {
            return this.top_measures[measureIndex].getFirstStaveNoteInMeasure();
        }
        else {
            return this.bottom_measures[measureIndex].getFirstStaveNoteInMeasure();
        }
    }

    private addTieBetweenNotes = (
        noteId: number,
    ): boolean => {
        let measureIndex = this.ID_to_MeasureIndexID.get(noteId)?.measureIndex;
        let noteIdStr = this.ID_to_MeasureIndexID.get(noteId)?.noteId;
        if (measureIndex == undefined || noteIdStr == undefined) return false;

        // Assume its in top at first
        let top: boolean = true;
        let notePair: { firstNote: StaveNote, secondNote: StaveNote | null } | null
            = this.searchForNotePairs(noteIdStr, measureIndex, /*top*/true);
        if (notePair == null) {
            // It may be in bottom
            top = false;
            notePair = this.searchForNotePairs(noteIdStr, measureIndex, /*top*/false);
        }
        // If notePair is null, then it couldn't find first note
        if (notePair == null) return false;
        console.log("Found first!");

        // Found first, but second was not in the measure
        if (notePair.secondNote == null) {
            notePair.secondNote = this.getFirstNoteInMeasure(measureIndex + 1, top);
            // We want to exclude rests
            if (notePair.secondNote?.isRest()) notePair.secondNote = null;
        }
        // If secondNote is null, then we tried to make a tie on the last note in Score, which for
        // now should just be invalid
        // Later, we can add a note, alongside a new measure
        if (notePair.secondNote == null) return false;
        console.log("Found second!");

        return this.createTies(notePair.firstNote, notePair.secondNote);
    }

    // Figure out how many measures in a line, then put all this logic into a function to be called
    // for each line, pass in an array of top and bottom measures, as well as a ceiling value
    private renderMeasures = (): void => {
        this.context.clear();

        let formatter = new Formatter();
        formatter.preFormat();
        let firstLineIndex = 0;
        let ceiling = 0;
        for (let i = 1; i < this.top_measures.length; i++) {
            let currentTopMeasure = this.top_measures[i];
            let prevTopMeasure = this.top_measures[i - 1];

            // this means there was a line shift
            if (prevTopMeasure.getStave().getY() != currentTopMeasure.getStave().getY()) {
                ceiling = this.calculateMeasureLine(
                    this.top_measures.slice(firstLineIndex, i),
                    this.bottom_measures.slice(firstLineIndex, i),
                    formatter, ceiling);
                firstLineIndex = i;
                // padding for next measure lines
                ceiling += DEFAULT_PADDING_IN_BETWEEN_MEASURES;
            }
        }

        this.calculateMeasureLine(
            this.top_measures.slice(firstLineIndex, this.top_measures.length),
            this.bottom_measures.slice(firstLineIndex, this.bottom_measures.length),
            formatter, ceiling);

        // With all measures rendered, we can now give them unique IDs, and Render Ties
        let IDCounter = 0;
        for (let i = 0; i < this.top_measures.length; i++) {
            IDCounter = this.giveIDs(this.top_measures[i].getVoice1().getTickables(), i, IDCounter, true);
            IDCounter = this.giveIDs(this.bottom_measures[i].getVoice1().getTickables(), i, IDCounter, true);
        }
        // From this point forward we render all elements that need voices to be drawn to be able to get placed
        // Render Ties/Slurs
        this.ties.forEach((noteID) => {
            // If we couldn't add a tie here, it was a bad tie, remove it from set
            if (!this.addTieBetweenNotes(noteID)) {
                this.ties.delete(noteID);
            }
        });

        formatter.postFormat();
    }
}
