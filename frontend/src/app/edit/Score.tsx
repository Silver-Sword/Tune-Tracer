import { Vex, Formatter, Voice } from 'vexflow';
import { Measure } from './Measure';

type RenderContext = InstanceType<typeof Vex.Flow.RenderContext>;

const DEFAULT_MEASURE_SPACING = 100;
const DEFAULT_NOTE_PADDING_FROM_TOP = 10;
const DEFAULT_PADDING_IN_BETWEEN_MEASURES= 50;

export class Score {
    private VF = Vex.Flow;
    private top_measures: Measure[] = [];
    private bottom_measures: Measure[] = [];  // both are equal in length
    private default_measure_width: number = 0;
    private context: RenderContext;

    constructor(
        notationRef: HTMLDivElement,
        x: number,
        y: number,
        measureWidth: number,
        timeSignature: string = "4/4"
    ) {
        this.default_measure_width = measureWidth;

        const renderer = new this.VF.Renderer(notationRef, this.VF.Renderer.Backends.SVG);
        renderer.resize(1000, 600);
        this.context = renderer.getContext();
        const firstTopMeasure = new Measure(this.context, x, y, measureWidth, timeSignature, "treble", true);
        // X and Y don't matter here because bottom measure always adjusts based on top measure
        const firstBottomMeasure = new Measure(this.context, x, y + DEFAULT_MEASURE_SPACING, measureWidth, timeSignature, "bass", true);

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
        // Always add at the end for now, later we can split this into its own function
        const topPrevMeasure: Measure = this.top_measures[this.top_measures.length - 1];
        const topX = topPrevMeasure.getX();
        const topY = topPrevMeasure.getStave().getY();
        const topTimeSignature = topPrevMeasure.getTimeSignature();
        const topClef = topPrevMeasure.getClef();

        const bottomPrevMeasure: Measure = this.bottom_measures[this.bottom_measures.length - 1];
        const bottomX = bottomPrevMeasure.getX();
        const bottomY = bottomPrevMeasure.getStave().getY();
        const bottomTimeSignature = bottomPrevMeasure.getTimeSignature();
        const bottomClef = bottomPrevMeasure.getClef();

        const newTopMeasure = new Measure(this.context, topX + this.default_measure_width, topY, this.default_measure_width, topTimeSignature, topClef, false);
        const newBottomMeasure = new Measure(this.context, bottomX + this.default_measure_width, bottomY, this.default_measure_width, bottomTimeSignature, bottomClef, false);
        this.top_measures.push(newTopMeasure);
        this.bottom_measures.push(newBottomMeasure);
        this.renderMeasures();
    }

    renderMeasures = (): void => {
        this.context.clear();

        let formatter = new Formatter();
        formatter.preFormat();
        // We want to know the largest bounding box in this line of measures
        // We'll use its coordinates to space all measures in the line
        let largestTopMeasureBoundingBoxY: number = 0;
        let largestBottomMeasureBoundingBoxY: number = 0;
        let largestTopMeasureBoundingBoxH: number = 0;
        let largestBottomMeasureBoundingBoxH: number = 0;

        for (let i = 0; i < this.top_measures.length; i++) {
            let topMeasure = this.top_measures[i];
            let bottomMeasure = this.bottom_measures[i];
            let topStave = topMeasure.getStave();
            let bottomStave = bottomMeasure.getStave();

            console.log("------PREPROCESSING------");

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
                return;
            }

            const topBoundingBoxTopY: number = topBoundingBox.getY();
            const topBoundingBoxH = topBoundingBox.getH();

            const bottomBoundingBoxTopY: number = bottomBoundingBox.getY();
            const bottomBoundingBoxH = bottomBoundingBox.getH();

            if (i == 0) {
                largestTopMeasureBoundingBoxY = topBoundingBoxTopY;
                largestTopMeasureBoundingBoxH =  topBoundingBox.getH();
                largestBottomMeasureBoundingBoxY = bottomBoundingBoxTopY;
                largestBottomMeasureBoundingBoxH = bottomBoundingBox.getH();
            }
            if (topBoundingBoxH > largestTopMeasureBoundingBoxH) {
                largestTopMeasureBoundingBoxY = topBoundingBoxTopY;
                largestTopMeasureBoundingBoxH =  topBoundingBox.getH();
            }
            if (bottomBoundingBoxH > largestBottomMeasureBoundingBoxH) {
                largestBottomMeasureBoundingBoxY = bottomBoundingBoxTopY;
                largestBottomMeasureBoundingBoxH = bottomBoundingBox.getH();
            }
            console.log("largestTopMeasureBoundingBoxH: "+ largestTopMeasureBoundingBoxH);
        }
        // Figure out the Y values for the Top measure and bottom measure
        // For now, we'll just figure out deltas for the measures

        let topMeasureDeltaDown = 0;
        // ceiling is 0 for now
        let ceiling = 0;
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
            console.log("THIS RAN");
            bottomMeasureDeltaDown = DEFAULT_PADDING_IN_BETWEEN_MEASURES + (largestTopMeasureBoundingBoxBottomY-largestBottomMeasureBoundingBoxY);
            console.log("BottomYofTopBoundingBox: " + largestTopMeasureBoundingBoxBottomY);
            console.log("largestBottomMeasureBoundingBoxY: "+ largestBottomMeasureBoundingBoxY);
            console.log("bottomMeasureYCoord: "+ bottomMeasureDeltaDown);

        }


        for (let i = 0; i < this.top_measures.length; i++) {
            console.log("------RENDERING------");
            let topMeasure = this.top_measures[i];
            let bottomMeasure = this.bottom_measures[i];
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

        formatter.postFormat();
    }
}
