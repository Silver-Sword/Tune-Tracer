import { Vex, Formatter, Voice } from 'vexflow';
import { Measure } from './Measure';

type RenderContext = InstanceType<typeof Vex.Flow.RenderContext>;


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
        const firstBottomMeasure = new Measure(this.context, x, y + 100, measureWidth, timeSignature, "bass", true);

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
        this.top_measures[measureIndex].modifyDuration(duration, noteId);
        this.renderMeasures();
    }

    addMeasure = (): void => {
        const prevMeasure: Measure = this.top_measures[this.top_measures.length - 1];
        // Always add at the end for now, later we can split this into its own function
        const x = prevMeasure.getX();
        const y = prevMeasure.getY();
        const timeSignature = prevMeasure.getTimeSignature();

        const newTopMeasure = new Measure(this.context, x + this.default_measure_width, y, this.default_measure_width, timeSignature, "none", false);
        const newBottomMeasure = new Measure(this.context, x + this.default_measure_width, y + 100, this.default_measure_width, timeSignature, "none", false);
        this.top_measures.push(newTopMeasure);
        this.bottom_measures.push(newBottomMeasure);
        this.renderMeasures();
    }

    renderMeasures = (): void => {
        this.context.clear();

        let formatter = new Formatter();
        formatter.preFormat();
        for (let i = 0; i < this.top_measures.length; i++) {
            let top_measure = this.top_measures[i];
            let bottom_measure = this.bottom_measures[i];
            let top_stave = top_measure.getStave();
            let bottom_stave = bottom_measure.getStave();

            top_stave.setContext(this.context).draw();
            bottom_stave.setContext(this.context).draw();

            if (i == 0) {
                // Create the brace and connect the staves
                const brace = new this.VF.StaveConnector(top_stave, bottom_stave);
                brace.setType(this.VF.StaveConnector.type.BRACE);
                brace.setContext(this.context).draw();
            }


            // Create the left line to connect the staves
            const lineLeft = new this.VF.StaveConnector(top_stave, bottom_stave);
            lineLeft.setType(this.VF.StaveConnector.type.SINGLE_LEFT);
            lineLeft.setContext(this.context).draw();

            // Create the right line to connect the staves
            const lineRight = new this.VF.StaveConnector(top_stave, bottom_stave);
            lineRight.setType(this.VF.StaveConnector.type.SINGLE_RIGHT);
            lineRight.setContext(this.context).draw();

            // Does the formatting for us!
            console.log("WE GOT HERE");

            if (top_measure.getVoice2() !== null) {
                // Tells formatter they need to be rendered on single stave
                formatter.joinVoices([top_measure.getVoice1(), top_measure.getVoice2()!])
                formatter.format([top_measure.getVoice1(), top_measure.getVoice2()!]);
                top_measure.getVoice1()?.draw(this.context, top_measure.getStave());
                top_measure.getVoice2()?.draw(this.context, top_measure.getStave());
            }
            else {
                formatter.formatToStave([top_measure.getVoice1()], top_measure.getStave());
                top_measure.getVoice1()?.draw(this.context, top_measure.getStave());
            }

            if (bottom_measure.getVoice2() !== null) {
                // Tells formatter they need to be rendered on single stave
                formatter.joinVoices([bottom_measure.getVoice1(), bottom_measure.getVoice2()!])
                formatter.format([bottom_measure.getVoice1(), bottom_measure.getVoice2()!]);
                bottom_measure.getVoice1()?.draw(this.context, bottom_measure.getStave());
                bottom_measure.getVoice2()?.draw(this.context, bottom_measure.getStave());
            }
            else {
                formatter.formatToStave([bottom_measure.getVoice1()], bottom_measure.getStave());
                bottom_measure.getVoice1()?.draw(this.context, bottom_measure.getStave());
            }
        }

        formatter.postFormat();
    }
}
