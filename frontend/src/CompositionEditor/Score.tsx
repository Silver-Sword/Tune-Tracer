import {Vex, Formatter, Voice} from 'vexflow';
import { Measure } from './Measure';

type RenderContext = InstanceType<typeof Vex.Flow.RenderContext>;


export class Score {
    private VF = Vex.Flow;
    private measures: Measure[] = [];
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
        const firstMeasure = new Measure(this.context, x, y, measureWidth, timeSignature, "treble", true);
        this.measures.push(firstMeasure);
        this.renderMeasures();
    }

    addNoteInMeasure = (
        measureIndex: number, 
        keys: string[], 
        duration: string, 
        noteId: string
    ): void => {
        this.measures[measureIndex].addNote(keys, duration, noteId);
        this.renderMeasures();
    }

    modifyDurationInMeasure = (
        measureIndex: number, 
        duration: string, 
        noteId: string
    ): void => {
        this.measures[measureIndex].modifyDuration(duration, noteId);
        this.renderMeasures();
    }

    addMeasure = (): void => {
        const prevMeasure: Measure = this.measures[this.measures.length - 1];
        // Always add at the end for now, later we can split this into its own function
        const x = prevMeasure.getX();
        const y = prevMeasure.getY();
        const timeSignature = prevMeasure.getTimeSignature();

        const newMeasure = new Measure(this.context, x + this.default_measure_width, y, this.default_measure_width, timeSignature, "none", false);
        this.measures.push(newMeasure);
        this.renderMeasures();
    }

    renderMeasures = (): void => {
        this.context.clear();

        let formatter = new Formatter();
        formatter.preFormat();
        this.measures.forEach(measure => {
            measure.getStave().setContext(this.context).draw();
            // Does the formatting for us!
            console.log("WE GOT HERE");
            
            if(measure.getVoice2() !== null)
            {
                // Tells formatter they need to be rendered on single stave
                formatter.joinVoices([measure.getVoice1(), measure.getVoice2()!])
                formatter.format([measure.getVoice1(), measure.getVoice2()!]);
                measure.getVoice1()?.draw(this.context, measure.getStave());
                measure.getVoice2()?.draw(this.context, measure.getStave());
            }
            else
            {
                formatter.formatToStave([measure.getVoice1()], measure.getStave());
                measure.getVoice1()?.draw(this.context, measure.getStave());
            }
        });
        formatter.postFormat();
    }
}
