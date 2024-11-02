import { Vex, Stave, StaveNote, Voice, Tickable, Accidental, Modifier, ModifierContext, Category } from 'vexflow';
import { getDefaultMeasureData, MeasureData, printMeasureData } from '../../../../lib/src/MeasureData'; // edit the tsconfig file to include this import
import { getDefaultStaveNoteData, ModifierData, StaveNoteData } from '../../../../lib/src/StaveNoteData';

const NOTE_PADDING = 50;
const MEASURE_PADDING = 90;
const TREBLE_WHOLE_REST_LOC = "d/5";
const TREBLE_REST_LOC = "b/4";
const BASS_WHOLE_REST_LOC = "f/3";
const BASS_REST_LOC = "d/3";


export class Measure {
    private VF = Vex.Flow;
    private stave: Stave;
    private RES: number = this.VF.RESOLUTION;
    private num_beats: number = 0;
    private beat_value: number = 0;
    private total_ticks: number = 0;
    private voice1: Voice;
    private voice2: Voice | null = null;
    private timeSignature: string = "";
    private clef: string = "";
    private rest_location: string = "";
    private whole_rest_location: string = "";
    public render_time_sig = false;
    private key_signature: string = "C";
    private x: number;
    private y: number;
    private width: number;
    public ids: number[] =[];

    constructor(
        x: number = 0,
        y: number = 0,
        width: number = 0,
        timeSignature: string = "none",
        clef: string = "none",
        renderTimeSignature = false,
        keySignature: string = "C",
        measureData: MeasureData | undefined = undefined
    ) {
        if (measureData !== undefined) {
            x = measureData.x;
            y = measureData.y;
            width = measureData.width;
            timeSignature = measureData.timeSignature;
            clef = measureData.clef;
            renderTimeSignature = measureData.renderTimeSignature;
        }
        this.x = x;
        this.y = y;
        this.stave = new this.VF.Stave(x, y, width);
        this.key_signature = keySignature;
        this.width = this.stave.getWidth();


        this.timeSignature = timeSignature;
        this.render_time_sig = renderTimeSignature;

        if (timeSignature !== "none") {
            this.processTimeSignature(timeSignature);
        }
        this.clef = clef;
        if (clef === "none" || clef === "treble") {
            clef = "treble";
            this.rest_location = TREBLE_REST_LOC;
            this.whole_rest_location = TREBLE_WHOLE_REST_LOC;
        }
        else if (clef === "bass") {
            this.rest_location = BASS_REST_LOC;
            this.whole_rest_location = BASS_WHOLE_REST_LOC;
        }
        else {
            console.error("CLEF IS INVALID");
        }
        // We don't want to render the clef if its none
        if (renderTimeSignature) {
            this.setClef(clef);
            this.stave.setKeySignature(keySignature);
        }
        


        let notes: StaveNote[] = [];
        if (measureData !== undefined && measureData.notes.length > 0) {
            measureData.notes.forEach((note) => {
                let newNote: StaveNote = new this.VF.StaveNote({ clef: this.clef, keys: note.keys, duration: note.duration });
                notes.push(newNote);
                if (note.dots > 0) newNote.addModifier(new this.VF.Dot());
                if (note.dots > 1) newNote.addModifier(new this.VF.Dot());
                note.modifiers.forEach((modifier) => {
                    const accidental = new Accidental(modifier.modifier);
                    newNote.addModifier(accidental, modifier.index);
                });
                newNote.setModifierContext(new ModifierContext());
            });
        }
        else {
            notes = [
                new this.VF.StaveNote({ clef: this.clef, keys: [this.getRestLocation("qr")], duration: "qr" }),
                new this.VF.StaveNote({ clef: this.clef, keys: [this.getRestLocation("qr")], duration: "qr" }),
                new this.VF.StaveNote({ clef: this.clef, keys: [this.getRestLocation("qr")], duration: "qr" }),
                new this.VF.StaveNote({ clef: this.clef, keys: [this.getRestLocation("qr")], duration: "qr" }),
            ];
        }

        notes.forEach((note) => {
            console.log("needed: " + new this.VF.StaveNote({ clef: this.clef, keys: [this.getRestLocation("qr")], duration: "qr" }).getTicks().value());
        })

        this.voice1 = new this.VF.Voice({ num_beats: this.num_beats, beat_value: this.beat_value }).addTickables(notes);
    }

    renderTimeSignature() {
        if (this.timeSignature === "none") return;
        this.stave.setTimeSignature(this.timeSignature);
    }

    renderSignatures = (render: boolean) => {
        this.render_time_sig = render;
        if (render) {
            this.setClef(this.clef);
            this.stave.setKeySignature(this.key_signature);
        }
        else {
            this.stave = new this.VF.Stave(this.x, this.y, this.width);
        }
    }

    setKeySignature = (keySignature: string) => {
        this.key_signature = keySignature;
    }

    findNote = (noteId: string): StaveNote | null => {
        let tickables = this.voice1.getTickables();
        for (let i = 0; i < tickables.length; i++) {
            let staveNote = tickables[i] as StaveNote;
            if (staveNote.getAttributes().id === noteId) {
                return staveNote;
            }
        }
        return null;
    }

    getNotes = (): StaveNote[] => {
        let tickables = this.voice1.getTickables();
        const notes: StaveNote[] = [];
        for (let i = 0; i < tickables.length; i++) {
            let staveNote = tickables[i] as StaveNote;
            notes.push(staveNote);
        }
        return notes;
    }

    exportMeasureDataObj = (): MeasureData => {
        let measureData: MeasureData = getDefaultMeasureData();
        measureData.clef = this.getClef();
        measureData.renderTimeSignature = this.render_time_sig;
        measureData.timeSignature = this.timeSignature;
        measureData.notes = [];
        measureData.x = this.x;
        measureData.y = this.y;
        measureData.width = this.stave.getWidth();
        measureData.keySignature = this.key_signature;

        this.voice1.getTickables().forEach((tickable) => {
            let staveNote = tickable as StaveNote;
            let staveNoteData: StaveNoteData = getDefaultStaveNoteData();


            // getDuration doesn't include dots, so we have to manually do it ourselves, yay!
            let newDuration = staveNote.getDuration();
            const modifiers = staveNote.getModifiers();
            

            // Filter the modifiers to count how many are dots
            const dotCount = modifiers.filter(modifier => modifier.getCategory() === 'Dot').length;
            if (dotCount > 0) newDuration += "d";
            if (dotCount > 1) newDuration += "d";
            if (staveNote.isRest()) newDuration += "r";

            let modifierDataArray: ModifierData[] = [];
            
            modifiers.forEach((modifier) => {
               let modifierData: ModifierData = {
                index: modifier.checkIndex(),
                modifier: modifier.getAttribute("type")
               }
               modifierDataArray.push(modifierData);
            });

            staveNoteData.modifiers = modifierDataArray;
            staveNoteData.dots = dotCount;
            staveNoteData.duration = newDuration;
            staveNoteData.keys = staveNote.getKeys();

            measureData.notes.push(staveNoteData);
        });
        //console.log("Measure Data: " + printMeasureData(measureData));
        return measureData;
    }

    getDurationForTicks = (ticks: number): string => {
        const tickToDurationMap: { [key: number]: string } = {
            [this.RES]: 'w',         // whole note
            [this.RES / 2]: 'h',     // half note
            [this.RES / 4]: 'q',     // quarter note
            [this.RES / 8]: '8',     // eighth note
            [this.RES / 16]: '16',   // sixteenth note
            [this.RES / 32]: '32',   // thirty-second note
            [this.RES / 64]: '64',   // sixty-fourth note
        };

        return tickToDurationMap[ticks] || '';
    }

    getRestLocation(duration: string) {
        if (duration.includes("w")) {
            return this.whole_rest_location;
        }
        else return this.rest_location;
    }

    getTimeSignature = (): string => {
        return this.timeSignature;
    }

    getKeySignature = (): string => {
        return this.key_signature;
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

    getCurrentBeats = (): number => {
        return this.num_beats;
    }

    getCurrentBeatValue = (): number => {
        return this.beat_value;
    }

    getClef = (): string => {
        return this.clef;
    }

    processTimeSignature = (timeSignature: string): void => {
        if (this.stave) {
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

    createDurationFromDots = (note: StaveNote): string => {
        let duration = note.getDuration();
        let modifiers = note.getModifiers();
        // Filter the modifiers to count how many are dots
        const dotCount = modifiers.filter(modifier => modifier.getCategory() === 'Dot').length;
        if (dotCount > 0) duration += "d";
        if (dotCount > 1) duration += "d";
        return duration;
    }

    addModifiers = (newNote: StaveNote, modifiers: Modifier[], modifierContext: ModifierContext | undefined) => {
        modifiers.forEach((modifier) => {
            newNote?.addModifier(modifier);
        });
        // Associate the ModifierContext with the note
        newNote.setModifierContext(modifierContext);
    }



    addNote = (keys: string[], noteId: string): StaveNote | null => {
        if (!this.voice1) return null;

        const VF = Vex.Flow;
        console.log("adding note noteID: " + noteId);
        const notes: StaveNote[] = [];
        let newNote: StaveNote | null = null;

        this.voice1.getTickables().forEach(tickable => {
            let staveNote = tickable as StaveNote;
            if (staveNote.getAttributes().id === noteId) {
                let countDots = staveNote.getModifiersByType('Dot').length;
                let duration = staveNote.getDuration();
                let modifiers = staveNote.getModifiers();
                let modiferContext = staveNote.getModifierContext();
                if (countDots > 0) duration += "d";
                if (countDots > 1) duration += "d";

                if (!staveNote.isRest()) {
                    const newKeys = staveNote.getKeys();
                    keys.forEach(key => {
                        // We don't want repeat keys
                        if (!newKeys.includes(key)) newKeys.push(key);
                    });
                    newNote = new VF.StaveNote({ clef: this.clef, keys: newKeys, duration });
                }
                // If the staveNote is a rest, then we replace it 
                else {
                    newNote = new VF.StaveNote({ clef: this.clef, keys, duration });
                }
                this.addModifiers(newNote, modifiers, modiferContext);
                notes.push(newNote);
            } else {
                // We just add the note that existed here previously (not changing anything on this beat)
                notes.push(staveNote as StaveNote);
            }
            // const svgNote = document.getElementById(this.createId(staveNote.getAttributes().id));
            // if (svgNote) svgNote.remove();
        });
        this.voice1 = new VF.Voice({ num_beats: this.num_beats, beat_value: this.beat_value }).addTickables(notes);

        return newNote;
        // When adding a note you never want to override another note
        // However, if the StaveNote you are overriding is at REST, then override
    }

    // This returns a pair of notes, the noteId Stavenote, and the note directly after if it exists.
    // This is used explicity for Ties
    getStaveNotePair = (noteId: string): { firstNote: StaveNote, secondNote: StaveNote | null } | null => {
        let voice1Array: Tickable[] = this.voice1.getTickables();
        let firstNote: StaveNote | null = null;
        let secondNote: StaveNote | null = null;
        for (let i = 0; i < voice1Array.length; i++) {
            let staveNote = voice1Array[i] as StaveNote;
            // If .isRest() is undefined, then the note is NOT a rest,
            let isRest: boolean = staveNote.isRest() !== undefined;
            if (firstNote !== null) {
                // If the note directly after the first is a rest, then second should be null
                // as ties cannot skip notes
                if (!isRest) secondNote = staveNote;
                return { firstNote, secondNote };
            }
            // We want to filter rests
            if (!isRest) {
                if (staveNote.getAttributes().id === noteId) {
                    firstNote = staveNote
                }
            }
        }
        if (firstNote !== null) return { firstNote, secondNote };
        // If we get here, we didn't even find the first note
        return null;
    }

    // Used for Ties
    getFirstStaveNoteInMeasure = (): StaveNote => {
        return this.voice1.getTickables()[0] as StaveNote;
    }

    private fillInTicks = (fillTicks: number): StaveNote[] => {
        let notes: StaveNote[] = [];
        const RES = Vex.Flow.RESOLUTION;
        // Step 2: Possible tick values in descending order
        //                   w      h        q      8           16       32        64
        const tickValues = [RES, RES / 2, RES / 4, RES / 8, RES / 16, RES / 32, RES / 64];

        // Step 3: Iterate over tick values and use division to fit as many notes as possible
        tickValues.forEach(tickValue => {
            const count = Math.floor(fillTicks / tickValue);  // How many notes of this duration fit
            // We'll always want to only add rests
            const noteDuration = this.getDurationForTicks(tickValue) + "r";
            if (noteDuration) {
                for (let i = 0; i < count; i++) {
                    const note = new this.VF.StaveNote({
                        clef: this.clef,
                        keys: [this.getRestLocation(noteDuration)],
                        duration: noteDuration,
                    });
                    console.log("Making a new note: " + note.getKeys());
                    notes.push(note);
                }
                fillTicks -= count * tickValue;  // Subtract the total ticks of these notes
            } else {
                throw new Error(`No valid duration found for ${tickValue} ticks.`);
            }

        });

        // This should never happen!
        if (fillTicks != 0) {
            throw new Error('Cannot exactly match the requested number of ticks with available durations.');
        }

        return notes;
    }

    private eatTicks = (startIndex: number, desiredTicks: number, tickables: Tickable[]): { replaceNotes: StaveNote[], index: number } => {
        for (let i = startIndex; i < tickables.length; i++) {

            let staveNote = tickables[i] as StaveNote;
            const currentNoteTicks = staveNote.getTicks().value();
            // We'll subtract, desiredTicks - currentNoteTicks, until desiredTicks < 0
            desiredTicks -= currentNoteTicks;
            if (desiredTicks < 0) {
                // Too may ticks in this note, we'll need to replace it with smaller notes
                // The negative value of desiredTicks (fillTicks) is the amount of ticks we need to create with smaller durations
                return { replaceNotes: this.fillInTicks(desiredTicks * - 1), index: i };
            }
            // If desiredTicks == 0 after subtraction, it was a clean cut
            else if (desiredTicks === 0) {
                return { replaceNotes: [], index: i };
            }
        }
        // We should never get here
        return { replaceNotes: [], index: tickables.length };
    }

    private createNote = (clef: string, keys: string[], duration: string, rest: boolean): StaveNote => {
        if (rest) {
            return new this.VF.StaveNote({ clef, keys: [this.getRestLocation(duration)], duration: duration + "r" });
        }
        // If there was a note here, we'll preserve its keys while changing its duration
        return new this.VF.StaveNote({ clef, keys, duration: duration });
    }

    getTicksAndDotsFromDuration = (duration: string): { returnTicks: number, countDots: number } => {
        let countDots = duration.split("d").length - 1;
        // Remove all d's
        const regex = new RegExp('d', 'g'); // 'g' for global replacement
        duration = duration.replace(regex, '');

        let returnTicks: number = this.VF.durationToTicks(duration);
        let oneDot = returnTicks / 2;
        let twoDot = oneDot / 2;
        if (countDots > 0) returnTicks += oneDot;
        if (countDots > 1) returnTicks += twoDot;
        return { returnTicks, countDots };
    }

    modifyDuration = (duration: string, noteId: string): boolean => {
        if (!this.voice1) return false;
        if (duration.includes("r")) return false;
        const VF = Vex.Flow;
        const notes: StaveNote[] = [];
        let ticksSeen: number = 0;

        let ticksAndDots: { returnTicks: number, countDots: number } = this.getTicksAndDotsFromDuration(duration);
        let newDesiredTicks = ticksAndDots.returnTicks;
        let countDots = ticksAndDots.countDots;

        let tickables = this.voice1.getTickables();
        let found: boolean = false;

        for (let i = 0; i < tickables.length; i++) {
            let staveNote = tickables[i] as StaveNote;
            if (staveNote.getAttributes().id === noteId) {
                found = true;
                const currentNoteTicks = staveNote.getTicks().value();
                let modifiersNoDots = staveNote.getModifiers().filter(modifier => !(modifier instanceof this.VF.Dot));
                let modifierContext = staveNote.getModifierContext();
                // if we want each note duration to be less, then we'll need to pad with rests
                if (newDesiredTicks < currentNoteTicks) {
                    // Calculates how many rests we can fit based on the old rest
                    const numberOfNewRests = Math.floor(currentNoteTicks / newDesiredTicks);
                    // Add our note with the new duration
                    notes.push(this.createNote(this.clef, staveNote.getKeys(), duration, staveNote.isRest()));
                    // Start at 1 since we already added one
                    for (let i = 1; i < numberOfNewRests; i++) {
                        notes.push(this.createNote(this.clef, staveNote.getKeys(), duration, true))
                    }
                    // We are filling in with desired duration, but there can be leftover ticks
                    // Say we replace a double dotted quarter note with a quarter note
                    // We can put in one quarter left, but there is .75 of a quarter note left in ticks
                    let leftOverTicks = currentNoteTicks - (numberOfNewRests * newDesiredTicks);
                    if (leftOverTicks > 0) {
                        this.fillInTicks(leftOverTicks).forEach(staveNote => {
                            notes.push(staveNote);
                        });
                    }
                }
                // Its greater than current duration... this is a bit complicated
                else {
                    // The our new notes array is composed of the following:
                    //      from Normal note array             a single staveNote                            a separate note array                                    normal note array
                    // [Notes before our target note] [Our target note, with its new duration] [any residual notes needed from eating a note with too many ticks] [the rest of the notes]

                    // Find how many ticks are left in the measure. If the duration needs more ticks than we have available, don't allow the change
                    let ticksLeft = this.total_ticks - ticksSeen;
                    if (ticksLeft < newDesiredTicks) {
                        return false;
                    }
                    // First we'll replace our current note with the new duration
                    console.log("staveNote.isRest(): " + staveNote.isRest());
                    let newNote = this.createNote(this.clef, staveNote.getKeys(), duration, staveNote.isRest());
                    if (countDots > 0) newNote.addModifier(new Vex.Flow.Dot());
                    if (countDots > 1) newNote.addModifier(new Vex.Flow.Dot());

                    this.addModifiers(newNote, modifiersNoDots, modifierContext);
                    notes.push(newNote);
                    // Our new duration is bigger, we'll need to eat Ticks
                    let returnFromEating: { replaceNotes: StaveNote[], index: number } = this.eatTicks(i, newDesiredTicks, tickables);
                    // Add any replacement Notes that broke up bigger notes
                    returnFromEating.replaceNotes.forEach(note => {
                        notes.push(note);
                    });
                    // This is the index that eating left off on.
                    // Since we increment, we'll skip that last 'eaten' note
                    i = returnFromEating.index;
                }
            }
            else {

                notes.push(staveNote as StaveNote);
            }
            ticksSeen += staveNote.getTicks().value();
            // Not sure if these had a purpose but commenting for now
            // const svgNote = document.getElementById(this.createId(staveNote.getAttributes().id));
            // if (svgNote) svgNote.remove();
        };
        this.voice1 = new VF.Voice({ num_beats: this.num_beats, beat_value: this.beat_value }).addTickables(notes);
        // Ensure to check that the total ticks match

        return found;
    }

    removeNote = (keys: string[], noteId: string): { staveNote: StaveNote | null, found: boolean } => {
        if (!this.voice1) return { staveNote: null, found: false };
        let fillInBack: boolean = false;
        let ticksToFill: number = 0;
        let returnNote: StaveNote | null = null;
        let found: boolean = false;

        const notes: StaveNote[] = [];

        this.voice1.getTickables().forEach(tickable => {
            let staveNote = tickable as StaveNote;
            if (staveNote.getAttributes().id === noteId) {
                if (keys.length === 1 && keys[0] === '') {
                    keys = staveNote.getKeys();
                }
                ticksToFill = staveNote.getTicks().value();
                found = true;
                // If its a rest, nice and simple, move to back
                if (staveNote.isRest()) {
                    fillInBack = true;
                }
                // If its a note, we should remove specified keys, then turn into rest if needed
                else {
                    const newKeys: string[] = [];
                    const oldKeys = staveNote.getKeys();
                    oldKeys.forEach(key => {
                        // Only include keys that we didn't specify for removal
                        if (!keys.includes(key)) newKeys.push(key);
                    });
                    // We've removed all the keys, fill in with appropriate rests
                    if (newKeys.length == 0) {
                        // We need to fill ticks here in case its a dotted note
                        this.fillInTicks(ticksToFill).forEach(staveNote => {
                            notes.push(staveNote);
                        });
                    }
                    // We haven't removed all keys, re-draw note
                    else {
                        // getDuration doesn't include dots, so we have to manually do it ourselves, yay!
                        let newDuration = staveNote.getDuration();
                        const modifiers = staveNote.getModifiers();
                        let modifierContext = staveNote.getModifierContext();

                        newDuration = this.createDurationFromDots(staveNote);

                        returnNote = new this.VF.StaveNote({ clef: this.clef, keys: newKeys, duration: newDuration });
                        this.addModifiers(returnNote, modifiers, modifierContext)
                        notes.push(returnNote);
                    }

                }
            }
            else {
                notes.push(staveNote as StaveNote);
            }
        });

        if (fillInBack) {
            this.fillInTicks(ticksToFill).forEach(staveNote => {
                notes.push(staveNote);
            });
        }
        this.voice1 = new this.VF.Voice({ num_beats: this.num_beats, beat_value: this.beat_value }).addTickables(notes);
        return { staveNote: returnNote, found };
    }

    addSharpToKeysInNote = (keys: string[], noteId: string) => {
        this.modifyAccidentalToKeysInNote(keys, noteId, "#");
    }

    addFlatToKeysInNote = (keys: string[], noteId: string) => {
        this.modifyAccidentalToKeysInNote(keys, noteId, "b");
    }

    addNaturalToKeysInNote = (keys: string[], noteId: string) => {
        this.modifyAccidentalToKeysInNote(keys, noteId, "n");
    }

    removeAccidentalsOnKeysInNote = (keys: string[], noteId: string) => {
        this.modifyAccidentalToKeysInNote(keys, noteId, "");
    }

    // Function to get all keys with accidentals
    private getIndicesWithAccidentalsNoDots = (staveNote: StaveNote): Map<number, number> => {
        const indsWithAccidentals: Map<number, number> = new Map();
        let modifiers = staveNote.getModifiers();
        for (let i = 0; i < modifiers.length; i++) {
            let modifier = modifiers[i];
            if (!(modifier instanceof this.VF.Dot)) indsWithAccidentals.set(modifier.checkIndex(), i);
        }

        return indsWithAccidentals;
    }

    private modifyAccidentalToKeysInNote = (keys: string[], noteId: string, modifier: string) => {
        if (!this.voice1) return { staveNote: null, found: false };
        this.voice1.getTickables().forEach(tickable => {
            let staveNote = tickable as StaveNote;
            let staveNoteData = getDefaultStaveNoteData();

            if (staveNote.getAttributes().id === noteId) {
                if(staveNote.isRest()) return;
                let notekeys = staveNote.getKeys();
                let inputKeySet = new Set(keys);
                let indsWithAccidentals = this.getIndicesWithAccidentalsNoDots(staveNote);
                for (let i = 0; i < notekeys.length; i++) {
                    if (inputKeySet.has(notekeys[i])) {
                        if (indsWithAccidentals.has(i)) {
                            let locationInModifierArray = indsWithAccidentals.get(i);
                            if (locationInModifierArray !== undefined) {
                                staveNote.getModifiers().splice(locationInModifierArray, 1); // Modify the array directly
                            }

                        }
                        if(modifier === "") continue;
                        // Create Accidental
                        const accidental = new Accidental(modifier);
                        
                        staveNote.addModifier(accidental, i);
                        staveNote.getModifiers()[staveNote.getModifiers().length - 1].setAttribute("type",modifier);
                    }
                }

            }

        });


    }


}
