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
    private firstNote: StaveNote | null;
    private secondNote: StaveNote | null;
    private same_measure: boolean;

    constructor(firstNote: StaveNote | null,
        secondNote: StaveNote | null,
        same_measure: boolean
    ) {
        this.firstNote = firstNote;
        this.secondNote = secondNote;
        this.same_measure = same_measure;
    }
    getFirstNote() {
        return this.firstNote;
    }
    getSecondNote() {
        return this.secondNote;
    }
    inSameMeasure() {
        return this.same_measure;
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
        if (!this.top_measures[measureIndex].addNote(keys, duration, noteId)) {
            this.bottom_measures[measureIndex].addNote(keys, duration, noteId)
        }
        this.renderMeasures();
    }

    searchForNote = (noteId: string, measureIndex: number): StaveNote | null => {
        let note: StaveNote | null = this.top_measures[measureIndex].getStaveNote(noteId, /*filter rests*/true);
        console.log("At search for Note, note is: " + note);
        if (note === null) {
            note = this.bottom_measures[measureIndex].getStaveNote(noteId, /*filter rests*/true);
        }
        return note;
    }

    addCurveBetweenNotes = (
        firstNoteId: string,
        firstNoteMeasureIndex: number,
        secondNoteId: string,
        secondNoteMeasureIndex: number
    ): void => {
        // Need to make sure the notes have the same pitch before allowing a tie
        // Note however that this doesn't apply to slurs, so this function should be generalized
        let firstNote: StaveNote | null = this.searchForNote(firstNoteId, firstNoteMeasureIndex);

        if (firstNote == null) return;
        console.log("Found first!");
        let secondNote: StaveNote | null = this.searchForNote(secondNoteId, secondNoteMeasureIndex);
        if (secondNote == null) return;
        console.log("Found second!");
        this.ties.push(new TieObject(firstNote, secondNote, firstNoteMeasureIndex === secondNoteMeasureIndex));

        this.renderMeasures();
    }

    modifyDurationInMeasure = (
        measureIndex: number,
        duration: string,
        noteId: string
    ): void => {
        if (!this.top_measures[measureIndex].modifyDuration(duration, noteId)) {
            this.bottom_measures[measureIndex].modifyDuration(duration, noteId)
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

    renderMeasureLine = (topMeasures: Measure[], bottomMeasures: Measure[], formatter: Formatter, ceiling: number): number => {
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
    // Figure out how many measures in a line, then put all this logic into a function to be called
    // for each line, pass in an array of top and bottom measures, as well as a ceiling value
    renderMeasures = (): void => {
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

        // Render Ties/Curves
        this.ties.forEach(tieObject => {
            console.log("Got here!");
            if (tieObject.inSameMeasure()) {
                // Create a tie between the twonotes
                const tie = new StaveTie({
                    first_note: tieObject.getFirstNote(),
                    last_note: tieObject.getSecondNote(),
                });

                // Draw the tie
                tie.setContext(this.context).draw();
                console.log("Drawneee!");
            }

        });

        formatter.postFormat();
    }
}
