import { Vex, Formatter, StaveNote, StaveTie } from 'vexflow';
import { Measure } from './Measure';
import { render } from '@testing-library/react';

type RenderContext = InstanceType<typeof Vex.Flow.RenderContext>;

const DEFAULT_MEASURE_VERTICAL_SPACING = 100;
const DEFAULT_NOTE_PADDING_FROM_TOP = 10;
const DEFAULT_PADDING_IN_BETWEEN_MEASURES = 50;
const DEFAULT_RENDERER_WIDTH = 1000;
const DEFAULT_RENDERER_HEIGHT = 2000;

const DEFAULT_FIRST_MEASURES_X = 20;
const DEFAULT_FIRST_MEASURES_Y = 0;

const DEFAULT_MEASURE_WIDTH = 325;
const DEFAULT_SPACING_BETWEEN_LINES_OF_MEASURES = 200;

class TieObject {
    private firstNote: StaveNote;
    private secondNote: StaveNote;
    private matched_first_indices: number[] | undefined;
    private matched_second_indices: number[] | undefined;

    constructor(firstNote: StaveNote,
        secondNote: StaveNote,
        matched_first_indices?: number[],
        matched_second_indices?: number[]
    ) {
        this.firstNote = firstNote;
        this.secondNote = secondNote;

        this.matched_first_indices = matched_first_indices;
        this.matched_second_indices = matched_second_indices;
    }
    getFirstNote() {
        return this.firstNote;
    }
    getSecondNote() {
        return this.secondNote;
    }
    setFirstNote(note: StaveNote) {
        this.firstNote = note;
    }
    setSecondNote(note: StaveNote) {
        this.secondNote = note;
    }
    getFirstIndices() {
        return this.matched_first_indices;
    }
    getSecondIndices() {
        return this.matched_second_indices;
    }
}

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
    private ties: TieObject[] = [];
    private context: RenderContext;
    private total_width: number = 0;

    constructor(
        notationRef: HTMLDivElement,
        timeSignature: string = "4/4"
    ) {
        this.total_width += DEFAULT_MEASURE_WIDTH + DEFAULT_FIRST_MEASURES_X;

        const renderer = new this.VF.Renderer(notationRef, this.VF.Renderer.Backends.SVG);
        renderer.resize(DEFAULT_RENDERER_WIDTH, DEFAULT_RENDERER_HEIGHT);
        this.context = renderer.getContext();
        const firstTopMeasure = new Measure(this.context, DEFAULT_FIRST_MEASURES_X, DEFAULT_FIRST_MEASURES_Y, DEFAULT_MEASURE_WIDTH, timeSignature, "treble", true);
        // X and Y don't matter here because bottom measure always adjusts based on top measure
        const firstBottomMeasure = new Measure(this.context, DEFAULT_FIRST_MEASURES_X, DEFAULT_FIRST_MEASURES_Y + DEFAULT_MEASURE_VERTICAL_SPACING, DEFAULT_MEASURE_WIDTH, timeSignature, "bass", true);

        this.top_measures.push(firstTopMeasure);
        this.bottom_measures.push(firstBottomMeasure);
        this.renderMeasures();
    }

    addNoteInMeasure = (
        measureIndex: number,
        keys: string[],
        duration: string,
        noteId: string
    ): void => {
        // Return new ID of note instead of boolean
        // Use that ID to record whether that staveNote has a Tie
        // If we ever see the ID get a note added to it, update its ID
        // Then add a Tie using the new ID
        // Change tie logic to take only one note
        // At render time, clean obselete ties
        let newNote: StaveNote | null = null;
        newNote = this.top_measures[measureIndex].addNote(keys, duration, noteId);
        if (newNote == null) {
            newNote = this.bottom_measures[measureIndex].addNote(keys, duration, noteId)
        }
        if (newNote !== null) {
            console.log("New ID: " + newNote.getAttribute('id'));
            this.updateTies(noteId, newNote);
        }
        this.renderMeasures();
    }

    private updateTies = (oldId: string, note: StaveNote): void => {
        this.ties.forEach(tieObject => {
            console.log("GETTING HERE");
            console.log("firstNote: " + tieObject.getFirstNote().getAttribute('id'));
            console.log("lastNote: " + tieObject.getSecondNote().getAttribute('id'));
            if (tieObject.getFirstNote().getAttribute('id') === oldId) {
                tieObject.setFirstNote(note);
                return;
            }
            if (tieObject.getSecondNote().getAttribute('id') === oldId) {
                tieObject.setSecondNote(note);
                return;
            }
        });
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


    // If you want to connect a tie to the end of the measure, repeat the indices for which the notes match: 
    //first_indices: [0,1],    // Tie on the first note (single note)
    //last_indices: [0,1]      // Tie on the second note
    //  Then just include the stavenote that is connecting to the end (first note will connect to end of measure, second to start)
    // If on same measure, then connect the indices such that the pitch is preserved
    private createTieObjects = (firstNote: StaveNote, secondNote: StaveNote): boolean => {
        // Get keys sorted by their vertical position
        const firstNoteSortedKeys = this.sortKeys(firstNote);
        const secondNoteKeys = this.sortKeys(secondNote);
        console.log("firstNoteSortedKeys: " + firstNoteSortedKeys);
        console.log("secondNoteKeys: " + secondNoteKeys);

        // We need to map keys to their vertical index position (they are sorted by vertical position so array index == vertical position)
        const secondNoteKeyMap = new Map<string, number>();
        secondNoteKeys.forEach((key, index) => {
            secondNoteKeyMap.set(key, index);
            console.log("mapping key: " + key, " index: " + index);
        });

        // These arrays will be the ones used when creating the ties. They specify the vertical index of the note that should be attached to another
        // the notes that are going to be attached need to maintain the same pitch
        let matchedFirstNoteKeyIndices: number[] = [];
        let matchedSecondNoteKeyIndices: number[] = [];

        let differentYs: boolean = false;

        // MatchedKeys will store the index of the matching keys present in both StaveNotes
        // Run thru the first set of keys, and if the second set of keys has it, 
        // store the vertical index for which the key occurs for both StaveNotes
        firstNoteSortedKeys.forEach((key, index) => {
            console.log("secondNoteKeyMap.get(key): " + secondNoteKeyMap.get(key));
            if (secondNoteKeyMap.has(key)) {
                matchedFirstNoteKeyIndices.push(index);
                // find the index for which the key occurs for the second note
                let secondIndex: number | undefined = secondNoteKeyMap.get(key);
                if (secondIndex == undefined) return;
                matchedSecondNoteKeyIndices.push(secondIndex);
                // If both staveNotes have the same key, cool we can make a tie
                // However, for rendering, we need to see if the StaveNotes are on a different
                // line of measures
                if (!differentYs) {
                    differentYs = firstNote.getYs()[index] == secondNote.getYs()[secondIndex];
                    console.log("firstNote.getYs()[index]: " + firstNote.getYs()[index]);
                    console.log("secondNote.getYs()[secondIndex]: " + secondNote.getYs()[secondIndex]);
                }
            }
        });
        console.log("matchedFirstNoteKeyIndices: " + matchedFirstNoteKeyIndices);
        console.log("matchedSecondNoteKeyIndices: " + matchedSecondNoteKeyIndices);

        // If its in the same measure, then we connect the tie between the two notes in the measure
        if (differentYs) {
            this.ties.push(new TieObject(firstNote, secondNote, matchedFirstNoteKeyIndices, matchedSecondNoteKeyIndices))
        }
        // Else, we'll want to make two separate tie objects, \
        //the first that connects the first note to the END of ITS measure, 
        // and then another object that connects the START of the SECOND NOTE'S measure to the second note
        else {

        }
        console.log("matchedFirstNoteKeyIndices.length ==0: " + (matchedFirstNoteKeyIndices.length == 0));
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
        if(measureIndex >= this.top_measures.length) return null;
        if (top) {
            return this.top_measures[measureIndex].getFirstStaveNoteInMeasure();
        }
        else {
            return this.bottom_measures[measureIndex].getFirstStaveNoteInMeasure();
        }
    }

    addTieBetweenNotes = (
        firstNoteId: string,
        firstNoteMeasureIndex: number,
    ): void => {
        // Assume its in top at first
        let top: boolean = true;
        let notePair: { firstNote: StaveNote, secondNote: StaveNote | null } | null 
            = this.searchForNotePairs(firstNoteId, firstNoteMeasureIndex, /*top*/true);
        if (notePair == null) {
            // It may be in bottom
            top = false;
            notePair = this.searchForNotePairs(firstNoteId, firstNoteMeasureIndex, /*bottom*/true);
        }
        // If notePair is null, then it couldn't find first note
        if (notePair == null) return;
        console.log("Found first!");

        // Found first, but second was not in the measure
        if(notePair.secondNote == null)
        {
            notePair.secondNote = this.getFirstNoteInMeasure(firstNoteMeasureIndex + 1, top);
        }
        // If secondNote is null, then we tried to make a tie on the last note in Score, which for
        // now should just be invalid
        // Later, we can add a note, alongside a new measure
        if (notePair.secondNote == null) return;
        console.log("Found second!");

        if (!this.createTieObjects(notePair.firstNote, notePair.secondNote)) return;
        this.renderMeasures();
    }

    modifyDurationInMeasure = (
        measureIndex: number,
        duration: string,
        noteId: string
    ): void => {
        let found: boolean = this.top_measures[measureIndex].modifyDuration(duration, noteId);
        if (!found) {
            found = this.bottom_measures[measureIndex].modifyDuration(duration, noteId)
        }
        if (found) {
            console.log(this.ties);
            // Remove ties associated with noteId
            // If the modified duration is the second note, then we don't remove it cause its ok to keep the tie
            this.ties = this.ties.filter(obj => obj.getFirstNote().getAttribute('id') !== noteId);
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
        if (this.total_width + DEFAULT_MEASURE_WIDTH > DEFAULT_RENDERER_WIDTH) {
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
        console.log("Total Width: " + this.total_width)

        const newTopMeasure = new Measure(this.context, topX, topY, DEFAULT_MEASURE_WIDTH, topTimeSignature, topClef, renderTopTimeSig);
        const newBottomMeasure = new Measure(this.context, bottomX, bottomY, DEFAULT_MEASURE_WIDTH, bottomTimeSignature, bottomClef, renderBottomTimeSig);
        this.top_measures.push(newTopMeasure);
        this.bottom_measures.push(newBottomMeasure);
        this.renderMeasures();
    }

    private renderMeasureLine = (topMeasures: Measure[], bottomMeasures: Measure[], formatter: Formatter, ceiling: number): number => {
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

            topMeasure.getVoice1().draw(this.context, topStave);
            bottomMeasure.getVoice1().draw(this.context, bottomStave);


        }
        return largestBottomMeasureBoundingBoxBottomY;
    }

    private renderCurve = (
        firstNote: StaveNote,
        lastNote: StaveNote,
        firstKeyIndices?: number[],
        lastKeyIndices?: number[]): void => {
        let curve: StaveTie | null = null;
        if (firstKeyIndices !== undefined && lastKeyIndices !== undefined) {
            // For simplicity, curves are just ties under the hood
            curve = new StaveTie({
                first_note: firstNote,
                last_note: lastNote,
                first_indices: firstKeyIndices,
                last_indices: lastKeyIndices,
            });
        }
        else {
            // If we got here, we are probably trying to make a slur
            // For simplicity, slurs are just ties under the hood
            curve = new StaveTie({
                first_note: firstNote,
                last_note: lastNote,
            });

        }
        console.log("Rendering Tie");
        console.log("firstNote: " + firstNote.getAttribute('id'));
        console.log("lastNote: " + lastNote.getAttribute('id'));
        // Draw the curve
        curve.setContext(this.context).draw();
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
                console.log("Found a line break");
                ceiling = this.renderMeasureLine(
                    this.top_measures.slice(firstLineIndex, i),
                    this.bottom_measures.slice(firstLineIndex, i),
                    formatter, ceiling);
                firstLineIndex = i;
                // padding for next measure lines
                ceiling += DEFAULT_PADDING_IN_BETWEEN_MEASURES;
            }
        }

        this.renderMeasureLine(
            this.top_measures.slice(firstLineIndex, this.top_measures.length),
            this.bottom_measures.slice(firstLineIndex, this.bottom_measures.length),
            formatter, ceiling);

        // From this point forward we render all elements that need voices to be drawn to be able to get placed
        // Render Ties/Slurs
        this.ties.forEach(tieObject => {
            // Render Curve just renders all the Tie Objects
            // If the indices don't exist, it renders a slur with default Tie generation logic
            this.renderCurve(tieObject.getFirstNote(), tieObject.getSecondNote(), tieObject.getFirstIndices(), tieObject.getSecondIndices())

        });

        formatter.postFormat();
    }
}
