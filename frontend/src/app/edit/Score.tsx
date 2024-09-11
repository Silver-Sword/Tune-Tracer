import { Vex, Formatter, Voice } from 'vexflow';
import { Measure } from './Measure';

type RenderContext = InstanceType<typeof Vex.Flow.RenderContext>;

const DEFAULT_MEASURE_SPACING = 10;
const DEFAULT_NOTE_PADDING_FROM_TOP = 10;

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
        renderer.resize(800, 400);
        this.context = renderer.getContext();
        const firstTopMeasure = new Measure(this.context, x, y, measureWidth, timeSignature, "treble", true);
        // X and Y don't matter here because bottom measure always adjusts based on top measure
        const firstBottomMeasure = new Measure(this.context, x, y, measureWidth, timeSignature, "bass", true);

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
        const prevMeasure: Measure = this.top_measures[this.top_measures.length - 1];
        // Always add at the end for now, later we can split this into its own function
        const x = prevMeasure.getX();
        const y = prevMeasure.getY();
        const timeSignature = prevMeasure.getTimeSignature();
        const clef = prevMeasure.getClef();

        const newTopMeasure = new Measure(this.context, x + this.default_measure_width, y, this.default_measure_width, timeSignature, clef, false);
        const newBottomMeasure = new Measure(this.context, x + this.default_measure_width, y + 100, this.default_measure_width, timeSignature, clef, false);
        this.top_measures.push(newTopMeasure);
        this.bottom_measures.push(newBottomMeasure);
        this.renderMeasures();
    }

    renderMeasures = (): void => {
        this.context.clear();

        let formatter = new Formatter();
        formatter.preFormat();
        for (let i = 0; i < this.top_measures.length; i++) {
            let topMeasure = this.top_measures[i];
            let bottomMeasure = this.bottom_measures[i];
            let topStave = topMeasure.getStave();
            let bottomStave = bottomMeasure.getStave();

            console.log("-------------------");

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
            // Need to format to stave first to get bounding box
            const topBoundingBoxY: number = topBoundingBox.getY();
            let bottomBoundingBoxTopY: number = bottomBoundingBox.getY();

            let topBoundingBoxBottomY = topBoundingBoxY + topBoundingBox.getH();
            let bottomBoundingBoxBottomY = bottomBoundingBoxTopY + bottomBoundingBox.getH();

            console.log("TopBounding Box Y: " + topBoundingBoxY);
            console.log("TopStave Box Y: " + topStave?.getY());

            if (topBoundingBoxY - DEFAULT_NOTE_PADDING_FROM_TOP < 0) {
                // Multiply by -1 because its above ceiling
                let deltaDown = (topBoundingBoxY * -1) + DEFAULT_NOTE_PADDING_FROM_TOP
                topStave.setY(topStave.getY() + deltaDown);
                // Make sure we update our bounding box value
                topBoundingBoxBottomY += deltaDown;
            }

            let oldY = bottomStave.getY();
            bottomStave.setY(topBoundingBoxBottomY + DEFAULT_MEASURE_SPACING);
            bottomBoundingBoxTopY += bottomStave.getY() - oldY;
            console.log("bottomBoundingBoxTopY: " + bottomBoundingBoxTopY);
            if (bottomBoundingBoxTopY < topBoundingBoxBottomY) {
                let deltaDown = (topBoundingBoxBottomY - bottomBoundingBoxTopY) + DEFAULT_NOTE_PADDING_FROM_TOP
                bottomStave.setY(bottomStave.getY() + deltaDown);
                // Make sure we update our bounding box value
                bottomBoundingBoxBottomY += deltaDown;
            }

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