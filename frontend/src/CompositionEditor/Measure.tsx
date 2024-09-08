import {Vex,Stave, StaveNote, Voice} from 'vexflow';


type RenderContext = InstanceType<typeof Vex.Flow.RenderContext>;

const NOTE_PADDING = 50;
const MEASURE_PADDING = 90;
const REST_LOC =  "b/4";
const HAT_REST_LOC = "d/5";

export class Measure {
    private VF = Vex.Flow;
    private stave: Stave;
    private context: RenderContext;
    private num_beats: number = 0;
    private beat_value: number = 0;
    private total_ticks: number = 0;
    private width: number = 0;
    private height: number = 0;
    private notes: StaveNote[] = [];
    private voice1: Voice;
    private voice2: Voice | null = null;
    private x: number = 0;
    private y: number = 0;
    private timeSignature: string = "";

    constructor(
        context: RenderContext,
        x: number,
        y: number,
        width: number,
        timeSignature: string = "none",
        clef: string = "none",
        renderTimeSignature = false
    ) {
        this.stave = new this.VF.Stave(x, y, width);
        this.width = width;
        this.height = this.stave.getHeight();
        this.context = context;
        this.x = x;
        this.y = y;
        this.timeSignature = timeSignature;

        console.log("Context in Measure: " + context);

        if (timeSignature !== "none") {
            this.processTimeSignature(timeSignature, renderTimeSignature);
        }
        console.log("Numbeats: " + this.num_beats);

        if (clef !== "none") {
            this.setClef(clef);
        }

        this.notes = [
            new this.VF.StaveNote({ keys: [REST_LOC], duration: "qr" }),
            new this.VF.StaveNote({ keys: [REST_LOC], duration: "qr" }),
            new this.VF.StaveNote({ keys: [REST_LOC], duration: "qr" }),
            new this.VF.StaveNote({ keys: [REST_LOC], duration: "qr" })
        ];

        this.voice1 = new this.VF.Voice({ num_beats: this.num_beats, beat_value: this.beat_value }).addTickables(this.notes);

        this.notes.forEach(note => {
            console.log(note.getTicks());
        });
    }
    getX = (): number => {
        return this.x;
    }
    getY = (): number => {
        return this.y;
    }

    getTimeSignature = (): string => {
        return this.timeSignature;
    }

    getVoice1 = (): Voice => {
        return this.voice1;
    }

    getVoice2 = (): Voice | null => {
        return this.voice2;
    }

    getStave = (): Stave => {
        return this.stave;
    }

    getNotes = (): StaveNote[] => {
        return this.notes;
    }

    getCurrentBeats = (): number => {
        return this.num_beats;
    }

    processTimeSignature = (timeSignature: string, renderTimeSig: boolean): void => {
        if (this.stave) {
            if(renderTimeSig)
            {
                this.stave.setTimeSignature(timeSignature);
            }
            const [numBeats, beatValue] = timeSignature.split("/").map(Number);
            this.num_beats = numBeats;
            this.beat_value = beatValue;
            const ticksPerWholeNote = this.VF.RESOLUTION; // 4096 ticks per whole note
            this.total_ticks = ticksPerWholeNote * (this.num_beats / this.beat_value);
        }
    }

    createId = (id: string): string => {
        return 'vf-' + id;
    }

    setClef = (clef: string): void => {
        if (this.stave) {
            this.stave.setClef(clef);
        }
    }

    private matchesNote = (staveNote: StaveNote, duration: string, noteId: string): boolean => {
        return staveNote.getAttributes().id === noteId && duration === staveNote.getDuration();
    }

    private isRest = (duration: string): boolean => {
        return duration.endsWith('r');
    }
    addNote = (keys: string[], duration: string, noteId: string): void => {
        if (this.isRest(duration)) return;
        if (!this.voice1) return;
        const VF = Vex.Flow;
        const notes: InstanceType<typeof Vex.Flow.StaveNote>[] = [];

        this.voice1.getTickables().forEach(tickable => {
            let staveNote = tickable as StaveNote;
            if (this.matchesNote(staveNote, duration, noteId)) {
                console.log("Matched StaveNote: " + staveNote);
                if (staveNote.getNoteType() !== 'r') {
                    const newKeys = staveNote.getKeys();
                    keys.forEach(key => {
                        // We don't want repeat keys
                        if (!newKeys.includes(key)) newKeys.push(key);
                    });
                    notes.push(new VF.StaveNote({ keys: newKeys, duration }));
                }
                // If the staveNote is a rest, then we replace it 
                else {
                    notes.push(new VF.StaveNote({ keys, duration }));
                }
            } else {
                // We just add the note that existed here previously (not changing anything on this beat)
                notes.push(staveNote as StaveNote);
            }
            const svgNote = document.getElementById(this.createId(staveNote.getAttributes().id));
            if (svgNote) svgNote.remove();
        });

        this.voice1 = new VF.Voice({ num_beats: this.num_beats, beat_value: this.beat_value }).addTickables(notes);
        // When adding a note you never want to override another note
        // However, if the StaveNote you are overriding is at REST, then override
    }

    modifyDuration = (duration: string, noteId: string): void => {
        if (!this.voice1) return;
        const VF = Vex.Flow;
        const notes: StaveNote[] = [];
        let ticksSeen: number = 0;
        let newRestTicks = VF.durationToTicks(duration);

        this.voice1.getTickables().forEach(tickable => {
            let staveNote = tickable as StaveNote;
            if (staveNote.getAttributes().id === noteId) {
                const currentNoteTicks = staveNote.getTicks().value();
                // if we want each note duration to be less, then we'll need to pad with rests
                if (newRestTicks < currentNoteTicks) {
                    // Calculates how many rests we can fit based on the old rest
                    const numberOfNewRests = currentNoteTicks / newRestTicks;
                    // If there was a note here, we'll preserve its keys while changing its duration
                    if(staveNote.isRest())
                    {
                        notes.push(new VF.StaveNote({ keys: staveNote.getKeys(), duration: duration +"r"}));
                    }
                    else 
                    {
                        notes.push(new VF.StaveNote({ keys: staveNote.getKeys(), duration}));
                    }
                    // start at 1 since we already added one
                    for(let i = 1; i < numberOfNewRests; i++)
                    {
                        notes.push(new VF.StaveNote({ keys: [REST_LOC], duration: duration + "r"}))
                    }
                }
                // Its greater than current duration... this is a bit complicated
                else
                {
                    // Bigger durations should "eat" subsequent notes and rests in the measure
                    // This applies to notes both in the current measure, and after
                    // The goal is to satisfy the desired duration placement over preserving existing notes

                    // It doesn't matter whether you increase the duration of a rest or note, the behavior should be the same:
                    // Add as large of a duration (in other words, as many ticks) as you can to the current measue
                    // Any overflow should follow the same logic with another measure and a new duration. 
                    // If we changed a note, the other measure should add that note with a slur
                    // If we changed a rest, the other measure should add the necessary rests to fill desired duration
                    
                    // With dots, this logic still 


                }
            }
            else {
                // We want ticks here, not instrinsic ticks, as we need to see if duration fits
                ticksSeen += staveNote.getTicks().value();
                notes.push(staveNote as StaveNote);
            }
            const svgNote = document.getElementById(this.createId(staveNote.getAttributes().id));
            if (svgNote) svgNote.remove();
        });
        this.voice1 = new VF.Voice({ num_beats: this.num_beats, beat_value: this.beat_value }).addTickables(notes);
        // Ensure to check that the total ticks match
    }

    
}
