import { Vex, Formatter, StaveNote, StaveTie, Beam, Tickable, BoundingBox } from 'vexflow';
import { Measure } from './Measure';
import { MeasureData } from '../../../../lib/src/MeasureData';
import { getDefaultScoreData, printScoreData, ScoreData } from '../../../../lib/src/ScoreData';

type RenderContext = InstanceType<typeof Vex.Flow.RenderContext>;




const DEFAULT_FIRST_MEASURES_X = 20;
const DEFAULT_FIRST_MEASURES_Y = 0;

const DEFAULT_MEASURE_WIDTH = 325;
const DEFUALT_RIGHT_SIDE_PADDING = 1;
const TIME_SIG_WIDTH = 10;
const NEW_HEIGHT_PADDING = 100;



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
    private formatter = new Formatter();
    private top_measures: Measure[] = [];
    private bottom_measures: Measure[] = [];  // both are equal in length
    private widths: number[] = [];
    private ties: Set<number> = new Set<number>();
    private context: RenderContext;
    private notationRef: HTMLDivElement;
    private total_width: number = 0;
    private renderer_height = 0;
    private renderer_width = 0;
    public ID_to_MeasureIndexID: Map<number, { measureIndex: number, noteId: string, topMeasure: boolean }> = new Map();
    private key_signature = "C";
    private title: string = "Untitled";

    private systems: { y: number, height: number }[] = [];
    private measureToIndexSystemIndex: Map<number, number> = new Map();

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
        this.notationRef = notationRef;
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
                DEFAULT_FIRST_MEASURES_Y,
                DEFAULT_MEASURE_WIDTH, timeSignature, "bass", true, this.key_signature);
            this.top_measures.push(firstTopMeasure);
            this.bottom_measures.push(firstBottomMeasure);
        }
        // Always renderTimeSig for first measures
        this.top_measures[0].renderTimeSignature();
        this.bottom_measures[0].renderTimeSignature();

    }

    getKeySignature = () => {
        return this.key_signature;
    }

    findNote = (noteId: number): StaveNote | null => {
        let measureIndex = this.ID_to_MeasureIndexID.get(noteId)?.measureIndex;
        let noteIdStr = this.ID_to_MeasureIndexID.get(noteId)?.noteId;
        let topMeasure = this.ID_to_MeasureIndexID.get(noteId)?.topMeasure;
        if (measureIndex == undefined || noteIdStr == undefined || topMeasure == undefined) { console.log('Something was null in Score.findNote()!'); return null; }
        if (topMeasure) {
            return this.top_measures[measureIndex].findNote(noteIdStr);
        }
        else {
            return this.bottom_measures[measureIndex].findNote(noteIdStr);
        }
    }

    getTopMeasures = (): Measure[] => {
        return this.top_measures;
    }

    getMeasureFromNoteId = (noteId: number): Measure | null => {
        let measureIndex = this.ID_to_MeasureIndexID.get(noteId)?.measureIndex;
        let topMeasure = this.ID_to_MeasureIndexID.get(noteId)?.topMeasure;
        if (measureIndex == undefined || topMeasure == undefined) { console.log('Something was null in Score.getMeasureFromNoteId()!'); return null; }
        if (topMeasure) {
            return this.top_measures[measureIndex];
        }
        else {
            return this.bottom_measures[measureIndex];
        }
    }

    getBottomMeasures = (): Measure[] => {
        return this.bottom_measures;
    }
    setTitle = (title: string) => {
        this.title = title;
    }

    setKeySignature = (keySignature: string): void => {
        this.key_signature = keySignature;
        this.top_measures.forEach((measure) => {
            measure.setKeySignature(keySignature);
        });
        this.bottom_measures.forEach((measure) => {
            measure.setKeySignature(keySignature);
        });
        this.renderMeasures();
    }

    exportScoreDataObj = (render: boolean = false): ScoreData => {
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
        scoreData.title = this.title;

        //console.log(printScoreData(scoreData));
        if (render) this.renderMeasures();
        return scoreData;
    }

    loadScoreDataObj = (scoreData: ScoreData, render: boolean = true) => {
        // this.renderer_height = scoreData.rendererHeight;
        // this.renderer_width = scoreData.rendererWidth;
        this.total_width = scoreData.totalWidth;
        this.ties = new Set<number>(scoreData.ties);
        this.top_measures = [];
        this.bottom_measures = [];
        this.key_signature = scoreData.topMeasures[0].keySignature;
        scoreData.topMeasures.forEach((topMeasure) => {
            this.top_measures.push(new Measure(undefined, undefined, undefined, undefined, undefined, undefined, undefined, topMeasure));
        });

        scoreData.bottomMeasures.forEach((bottomMeasure) => {
            this.bottom_measures.push(new Measure(undefined, undefined, undefined, undefined, undefined, undefined, undefined, bottomMeasure));
        });
        //console.log("score data: " + printScoreData(scoreData));
        // Always renderTimeSig for first measures
        this.top_measures[0].renderTimeSignature();
        this.bottom_measures[0].renderTimeSignature();
        if (render) {
            this.calculateWidths();
            this.renderMeasures();
        }
    }

    isTopMeasure = (
        noteId: number
    ): boolean => {
        let isInTopMeasure = this.ID_to_MeasureIndexID.get(noteId)?.topMeasure;
        if (isInTopMeasure) {
            return isInTopMeasure;
        }
        return false;
    }

    addNoteInMeasure = (
        keys: string[],
        noteId: number
    ): void => {
        let measureIndex = this.ID_to_MeasureIndexID.get(noteId)?.measureIndex;
        let noteIdStr = this.ID_to_MeasureIndexID.get(noteId)?.noteId;
        if (measureIndex == undefined || noteIdStr == undefined) return;

        let newNote: StaveNote | null = null;
        newNote = this.top_measures[measureIndex].addNote(keys, noteIdStr);
        if (newNote == null) {
            newNote = this.bottom_measures[measureIndex].addNote(keys, noteIdStr)
        }
        // Voice changes, so widths need to be recalculated
        this.calculateWidths();
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
        // Voice changes, so widths need to be recalculated
        this.calculateWidths();
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

    getForwardAdjacentNote = (noteId: number): number => {
        let measureIndex1 = this.ID_to_MeasureIndexID.get(noteId)?.measureIndex;
        let topMeasure1 = this.ID_to_MeasureIndexID.get(noteId)?.topMeasure;
        if (measureIndex1 == null) return noteId;
        const newNoteID = noteId + 1;
        let topMeasure2 = this.ID_to_MeasureIndexID.get(newNoteID)?.topMeasure;
        let measureIndex2 = this.ID_to_MeasureIndexID.get(newNoteID)?.measureIndex;
        if (measureIndex2 == null) return noteId;

        if (topMeasure1 !== topMeasure2) {
            // Skip over all the notes of the next measure 
            if (topMeasure1) {
                let returnID = newNoteID + this.bottom_measures[measureIndex1].getVoice1().getTickables().length;
                if(!this.ID_to_MeasureIndexID.has(returnID)) return noteId;
                return returnID;
            }
            else {
                let returnID = newNoteID + this.top_measures[measureIndex2].getVoice1().getTickables().length;
                if(!this.ID_to_MeasureIndexID.has(returnID)) return noteId;
                return returnID;
            }
        }
        return newNoteID;
    }

    getBackwardAdjacentNote = (noteId: number): number => {
        let measureIndex1 = this.ID_to_MeasureIndexID.get(noteId)?.measureIndex;
        let topMeasure1 = this.ID_to_MeasureIndexID.get(noteId)?.topMeasure;
        if (measureIndex1 == null) return noteId;
        const newNoteID = noteId - 1;
        let topMeasure2 = this.ID_to_MeasureIndexID.get(newNoteID)?.topMeasure;
        let measureIndex2 = this.ID_to_MeasureIndexID.get(newNoteID)?.measureIndex;
        if (measureIndex2 == null) return noteId;

        if (topMeasure1 !== topMeasure2) {
            // Skip over all the notes of the next measure 
            if (topMeasure1) {
                let returnID = newNoteID - this.bottom_measures[measureIndex1].getVoice1().getTickables().length;
                if(returnID < 0) return noteId
                return returnID;
            }
            else {
                let returnID = newNoteID - this.top_measures[measureIndex2].getVoice1().getTickables().length;
                if(returnID < 0) return noteId
                return returnID;
            }
        }
        return newNoteID;
    }

    getSystemIndexForMeasure = (measureIndex: number): number => {
        return this.measureToIndexSystemIndex.get(measureIndex) || 0;
    }

    getSystems = (): { y: number; height: number }[] => {
        return this.systems;
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
            // Remove ties associated with noteId
            if (this.ties.has(noteId)) this.ties.delete(noteId);
        }
        // Voice changes so recalculate widths
        this.calculateWidths();
        this.renderMeasures();
    }

    addSharp = (
        keys: string[],
        noteId: number
    ): void => {
        let measureIndex = this.ID_to_MeasureIndexID.get(noteId)?.measureIndex;
        let noteIdStr = this.ID_to_MeasureIndexID.get(noteId)?.noteId;
        let topMeasure = this.ID_to_MeasureIndexID.get(noteId)?.topMeasure;
        if (measureIndex == undefined || noteIdStr == undefined) return;

        if (topMeasure) this.top_measures[measureIndex].addSharpToKeysInNote(keys, noteIdStr);
        else this.bottom_measures[measureIndex].addSharpToKeysInNote(keys, noteIdStr);
        // Voice changes, so widths need to be recalculated
        this.calculateWidths();
        this.renderMeasures();
    }

    addFlat = (
        keys: string[],
        noteId: number
    ): void => {
        let measureIndex = this.ID_to_MeasureIndexID.get(noteId)?.measureIndex;
        let noteIdStr = this.ID_to_MeasureIndexID.get(noteId)?.noteId;
        let topMeasure = this.ID_to_MeasureIndexID.get(noteId)?.topMeasure;
        if (measureIndex == undefined || noteIdStr == undefined) return;

        if (topMeasure) this.top_measures[measureIndex].addFlatToKeysInNote(keys, noteIdStr);
        else this.bottom_measures[measureIndex].addFlatToKeysInNote(keys, noteIdStr);
        // Voice changes, so widths need to be recalculated
        this.calculateWidths();
        this.renderMeasures();
    }

    addNatural = (
        keys: string[],
        noteId: number
    ): void => {
        let measureIndex = this.ID_to_MeasureIndexID.get(noteId)?.measureIndex;
        let noteIdStr = this.ID_to_MeasureIndexID.get(noteId)?.noteId;
        let topMeasure = this.ID_to_MeasureIndexID.get(noteId)?.topMeasure;
        if (measureIndex == undefined || noteIdStr == undefined) return;

        if (topMeasure) this.top_measures[measureIndex].addNaturalToKeysInNote(keys, noteIdStr);
        else this.bottom_measures[measureIndex].addNaturalToKeysInNote(keys, noteIdStr);
        // Voice changes, so widths need to be recalculated
        this.calculateWidths();
        this.renderMeasures();
    }

    removeAccidentals = (
        keys: string[],
        noteId: number
    ): void => {
        let measureIndex = this.ID_to_MeasureIndexID.get(noteId)?.measureIndex;
        let noteIdStr = this.ID_to_MeasureIndexID.get(noteId)?.noteId;
        let topMeasure = this.ID_to_MeasureIndexID.get(noteId)?.topMeasure;
        if (measureIndex == undefined || noteIdStr == undefined) return;

        if (topMeasure) this.top_measures[measureIndex].removeAccidentalsOnKeysInNote(keys, noteIdStr);
        else this.bottom_measures[measureIndex].removeAccidentalsOnKeysInNote(keys, noteIdStr);
        // Voice changes, so widths need to be recalculated
        this.calculateWidths();
        this.renderMeasures();
    }

    addMeasure = (): void => {
        // First get all the necessary information from the previous measure as a baseline
        let topPrevMeasure: Measure = this.top_measures[this.top_measures.length - 1];

        let topTimeSignature = topPrevMeasure.getTimeSignature();
        let topKeySignature = topPrevMeasure.getKeySignature();
        let topClef = topPrevMeasure.getClef();
        let renderTopTimeSig = false;

        let bottomPrevMeasure: Measure = this.bottom_measures[this.bottom_measures.length - 1];

        let bottomTimeSignature = bottomPrevMeasure.getTimeSignature();
        let bottomKeySignature = bottomPrevMeasure.getKeySignature();
        let bottomClef = bottomPrevMeasure.getClef();
        let renderBottomTimeSig = false;

        // We don't care about the X and Y here anymore. The render measure line will be the only source of truth for X and Y coordinates
        const newTopMeasure = new Measure(DEFAULT_FIRST_MEASURES_X, DEFAULT_FIRST_MEASURES_Y, DEFAULT_MEASURE_WIDTH, topTimeSignature, topClef, renderTopTimeSig, topKeySignature);
        const newBottomMeasure = new Measure(DEFAULT_FIRST_MEASURES_X, DEFAULT_FIRST_MEASURES_Y, DEFAULT_MEASURE_WIDTH, bottomTimeSignature, bottomClef, renderBottomTimeSig, bottomKeySignature);
        this.top_measures.push(newTopMeasure);
        this.bottom_measures.push(newBottomMeasure);
        this.renderMeasures();
        this.calculateWidths();
    }

    removeMeasure = (): void => {
        if (this.top_measures.length > 1) {
            this.top_measures.pop()
            this.bottom_measures.pop()
            // Always renderTimeSig for first measures
            this.top_measures[0].renderTimeSignature();
            this.bottom_measures[0].renderTimeSignature();
            this.renderMeasures();
        }
    }

    private generateBeams = (measure: Measure) => {
        const beams = Beam.generateBeams(measure.getVoice1().getTickables() as StaveNote[]);
        beams.forEach((b) => {
            b.setContext(this.context).draw();
        });
    }

    private giveIDs = (tickables: Tickable[], measureIndex: number, IDCounter: number, topMeasure: boolean, measure: Measure) => {
        measure.ids = [];
        tickables.forEach(tickable => {
            let staveNote = tickable as StaveNote;
            if (staveNote.getModifiers().length !== 0) {
                staveNote.getModifiers().forEach((modifier) => {
                    //console.log("ATTRIBBUTE: " + modifier.getAttribute("mod"));
                });
            }
            staveNote.getSVGElement()?.setAttribute('id', IDCounter + "");
            // We map our generated ID to the ID vexflow generates. This is because we don't have access to the SVG ID before note is drawn
            // Before the note is drawn, we need a way to reference that. 
            // Instead of re-inventing the wheel, I'm mapping new IDs to old IDs to not mess with logic
            // This means we can reference notes with new ID, but under the hood its still using old logic
            measure.ids.push(IDCounter);
            this.ID_to_MeasureIndexID.set(IDCounter, { measureIndex, noteId: staveNote.getAttributes().id, topMeasure });
            IDCounter++;
        });
        return IDCounter;
    }

    private renderMeasureLine = (topMeasures: Measure[], bottomMeasures: Measure[]) => {
        for (let i = 0; i < topMeasures.length; i++) {
            let topMeasure = topMeasures[i];
            let bottomMeasure = bottomMeasures[i];
            let topStave = topMeasure.getStave();
            let bottomStave = bottomMeasure.getStave();

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
        }
    }

    private calculateALineOfMeasures = (measures: Measure[], ceiling: number, index: number): { bottomY: number; topY: number } => {
        // We want to know the largest bounding box in this line of measures
        // We'll use its coordinates to space all measures in the line
        let smallestY: number = Number.MAX_VALUE;
        let largestY: number = Number.MIN_VALUE;

        for (let i = 0; i < measures.length; i++) {
            let measure = measures[i];
            // Render signatures for first measure only
            if (i == 0) measure.renderSignatures(true);
            else measure.renderSignatures(false);

            let stave = measure.getStave();
            // This puts all measures on the same playing field
            stave.setX(200);
            stave.setY(200);

            const Voice1 = measure.getVoice1();
            Voice1.setStave(stave);
            this.formatter.formatToStave([Voice1], stave);
            // Here we manually recalculate the Voice Bounding box. We do this so that all bounding box
            // computations, stave and voice, are calculated on the same spot
            // This took like 8 hours that I had to do this
            let voiceBoundingBox: BoundingBox | undefined = undefined;
            let tickables: Tickable[] = Voice1.getTickables();
            for (let i = 0; i < tickables.length; i++) {
                let tickable = tickables[i];
                tickable.setStave(stave);   // Rebind notes to the new stave
                const bb = tickable.getBoundingBox();
                if (bb) {
                    voiceBoundingBox = voiceBoundingBox ? voiceBoundingBox.mergeWith(bb) : bb;
                }

                tickable.setContext(this.context);
            }

            let staveBoundingBox = stave.getBoundingBox();
            // Used for debugging
            // if (voiceBoundingBox) {
            //     this.context.setLineWidth(4);
            //     this.context.rect(voiceBoundingBox.getX(), voiceBoundingBox.getY(),
            //     voiceBoundingBox.getW(), voiceBoundingBox.getH());
            //     this.context.stroke();
            // }

            // if (staveBoundingBox) {
            //     this.context.setLineWidth(4);
            //     this.context.rect(staveBoundingBox.getX(), staveBoundingBox.getY(),
            //     staveBoundingBox.getW(), staveBoundingBox.getH());
            //     this.context.stroke();
            // }
            if (!voiceBoundingBox) continue;
            smallestY = Math.min(smallestY, Math.min(voiceBoundingBox.getY(), staveBoundingBox.getY()));
            largestY = Math.max(largestY, Math.max(voiceBoundingBox.getY() + voiceBoundingBox.getH(), staveBoundingBox.getY() + staveBoundingBox.getH()));

        }
        let firstStave = measures[0].getStave();

        // --------------------------------------------

        // We'll need the difference between the top of the stave, and the top of the bounding box
        // Remember though, the larger the coordinate, the further down on the screen
        // The Y coordinate of the largestBoundingBox can even be negative! So subtracting will make the stave go down further
        // which is desired behavior
        let pushDownStave = firstStave.getYForTopText() - smallestY;

        let YCoordinateForAllMeasuresInThisLine = ceiling + pushDownStave;

        // This should be the only place where coordinates are set for final draw
        let XCoordinate = DEFAULT_FIRST_MEASURES_X;
        for (let i = 0; i < measures.length; i++) {
            measures[i].getStave().setX(XCoordinate);
            measures[i].getStave().setY(YCoordinateForAllMeasuresInThisLine);
            measures[i].getStave().setWidth(this.widths[i + index]);
            measures[i].getVoice1().setStave(measures[i].getStave());
            measures[i].getVoice1().setContext(this.context);
            this.formatter.formatToStave([measures[i].getVoice1()], measures[i].getStave());
            XCoordinate += measures[i].getStave().getWidth();
            measures[i].getStave().setContext(this.context).draw();
            this.generateBeams(measures[i]);
            measures[i].getVoice1().draw(this.context);

            this.formatter.postFormat();

        }

        // return ceiling + largestY - smallestY;
        return {
            topY: YCoordinateForAllMeasuresInThisLine,
            bottomY: YCoordinateForAllMeasuresInThisLine + (largestY - smallestY),
        }
    }

    private calculateMeasureLine = (topMeasures: Measure[], bottomMeasures: Measure[], ceiling: number, index: number): number => {
        const topResult = this.calculateALineOfMeasures(topMeasures, ceiling, index);
        const bottomResult = this.calculateALineOfMeasures(bottomMeasures, topResult.bottomY, index);
        // Render the stave connectors
        this.renderMeasureLine(topMeasures, bottomMeasures);

        // Calculate system position and height
        const systemY = topResult.topY;
        const systemHeight = bottomResult.bottomY - topResult.topY;

        // Store the system info
        this.systems.push({
            y: systemY,
            height: systemHeight,
        });

        return bottomResult.bottomY;
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

        return this.createTies(notePair.firstNote, notePair.secondNote);
    }

    private calculateSystemWidth = (minSystemWidths: number[], totalWidth: number): number[] => {
        let widthToFill = this.renderer_width - totalWidth;
        // We want to see what percentage of the total width each measure takes up
        let percentages: number[] = [];
        minSystemWidths.forEach((width) => {
            percentages.push(width / totalWidth);
        });
        for (let i = 0; i < minSystemWidths.length; i++) {
            // Each measure should proportionally consume the width to fill 
            // This helps give more room to measures that need it, and less to measures that don't
            minSystemWidths[i] += widthToFill * percentages[i];
        }
        return minSystemWidths;
    }

    // Here we'll calculate the widths needed to horizontally fill the page
    private fillWidthsToPage = (minWidths: number[]): number[] => {
        let totalWidth = DEFAULT_FIRST_MEASURES_X;
        let firstLineIndex = 0;
        let optimalWidths: number[] = [];
        for (let i = 0; i < this.top_measures.length; i++) {
            let currentWidth = minWidths[i];
            // Here, a system should be stretched to fit horizontally before another system
            // is created below
            if (totalWidth + currentWidth > this.renderer_width) {
                // Take this system and stretch to fit page
                this.calculateSystemWidth(minWidths.slice(firstLineIndex, i), totalWidth).forEach((width) => {
                    optimalWidths.push(width);
                });
                // Define starting point for next system
                firstLineIndex = i;
                // Reset totalWidth number
                totalWidth = DEFAULT_FIRST_MEASURES_X;
            }
            totalWidth += currentWidth;
        }
        // We won't adjust the width the for last system
        for (let i = firstLineIndex; i < this.top_measures.length; i++) {
            optimalWidths.push(minWidths[i]);
        }
        return optimalWidths;
    }

    private calculateWidths = (): void => {
        this.formatter.preFormat();
        let minWidths: number[] = [];
        for (let i = 0; i < this.top_measures.length; i++) {
            let topMeasure = this.top_measures[i];
            let topStave = topMeasure.getStave();
            let topVoice1 = topMeasure.getVoice1();

            let bottomMeasure = this.bottom_measures[i];
            let bottomStave = bottomMeasure.getStave();
            let bottomVoice1 = bottomMeasure.getVoice1();

            this.formatter.formatToStave([topVoice1], topStave);
            this.formatter.formatToStave([bottomVoice1], bottomStave);

            // Join Voices for calculation
            this.formatter.joinVoices([topVoice1]);
            this.formatter.joinVoices([bottomVoice1]);

            // Calculate the minimum required width for the top notes
            const minTopStaveWidth = this.formatter.preCalculateMinTotalWidth([topMeasure.getVoice1()]);
            const topModifiers = topStave.getModifiers();
            let topModifierWidths = topModifiers.reduce((total, modifier) => total + modifier.getWidth(), 0);
            // We want to give breathing room to the time sig that will eventually be rendered
            if(i==0) topModifierWidths += TIME_SIG_WIDTH;

            const topWidth = minTopStaveWidth + topModifierWidths;

            // Calculate the minimum required width for the bottom notes
            const minBottomStaveWidth = this.formatter.preCalculateMinTotalWidth([bottomMeasure.getVoice1()]);
            const bottomModifiers = bottomStave.getModifiers();
            let bottomModifierWidths = bottomModifiers.reduce((total, modifier) => total + modifier.getWidth(), 0);
            // We want to give breathing room to the time sig that will eventually be rendered
            if(i==0) bottomModifierWidths += TIME_SIG_WIDTH;
            const bottomWidth = minBottomStaveWidth + bottomModifierWidths;

            // Get the largest width needed
            const finalWidth = Math.max(DEFAULT_MEASURE_WIDTH, Math.max(topWidth, bottomWidth));

            minWidths.push(finalWidth);

        }
        let optimalWidths = this.fillWidthsToPage(minWidths);
        this.widths = [];
        for (let i = 0; i < this.top_measures.length; i++) {
            // Use this to cap widths. It wont look pretty if a stave is maxxed out, but oh well
            let finalWidth = Math.min(
                this.renderer_width - DEFAULT_FIRST_MEASURES_X - DEFUALT_RIGHT_SIDE_PADDING, 
                optimalWidths[i]);
            this.widths.push(finalWidth);
        }

    }

    // Figure out how many measures in a line, then put all this logic into a function to be called
    // for each line, pass in an array of top and bottom measures, as well as a ceiling value
    renderMeasures = (): void => {
        this.context.clear();

        this.systems = [];
        this.measureToIndexSystemIndex = new Map();

        let firstLineIndex = 0;
        let ceiling = 0;
        let currentWidth = DEFAULT_FIRST_MEASURES_X;
        let systemIndex = 0;

        for (let i = 0; i < this.top_measures.length; i++) {
            let topMeasure = this.top_measures[i];
            let topStave = topMeasure.getStave();
            let width = topStave.getWidth();

            // there needs to be a line shift
            if (currentWidth + width > this.renderer_width) {
                const newCeiling = this.calculateMeasureLine(
                    this.top_measures.slice(firstLineIndex, i),
                    this.bottom_measures.slice(firstLineIndex, i),
                    ceiling,
                    firstLineIndex
                );

                // Map measures to system index
                for (let j = firstLineIndex; j < i; j++) {
                    this.measureToIndexSystemIndex.set(j, systemIndex);
                }
                systemIndex++;

                firstLineIndex = i;
                // padding for next measure lines
                ceiling = newCeiling;

                currentWidth = DEFAULT_FIRST_MEASURES_X;
            }
            currentWidth += topMeasure.getStave().getWidth();
        }
        // Process the last line of measures
        const newCeiling = this.calculateMeasureLine(
            this.top_measures.slice(firstLineIndex, this.top_measures.length),
            this.bottom_measures.slice(firstLineIndex, this.bottom_measures.length),
            ceiling,
            firstLineIndex
        );

        if(newCeiling > this.renderer_height)
        {
            this.renderer_height = this.renderer_height + (newCeiling - this.renderer_height + NEW_HEIGHT_PADDING);
            this.context.resize(this.renderer_width, this.renderer_height);
        }
        else if(this.renderer_height - newCeiling > 500)
            {
                this.renderer_height = this.renderer_height - (this.renderer_height - newCeiling  - NEW_HEIGHT_PADDING);
                this.context.resize(this.renderer_width, this.renderer_height);
            }

        // Map remaining measures to system index
        for (let j = firstLineIndex; j < this.top_measures.length; j++) {
            this.measureToIndexSystemIndex.set(j, systemIndex);
        }
        systemIndex++;

        // With all measures rendered, we can now give them unique IDs, and Render Ties
        let IDCounter = 0;
        for (let i = 0; i < this.top_measures.length; i++) {
            IDCounter = this.giveIDs(this.top_measures[i].getVoice1().getTickables(), i, IDCounter, true, this.top_measures[i]);
            IDCounter = this.giveIDs(this.bottom_measures[i].getVoice1().getTickables(), i, IDCounter, false, this.bottom_measures[i]);
        }
        // From this point forward we render all elements that need voices to be drawn to be able to get placed
        // Render Ties/Slurs
        this.ties.forEach((noteID) => {
            // If we couldn't add a tie here, it was a bad tie, remove it from set
            if (!this.addTieBetweenNotes(noteID)) {
                this.ties.delete(noteID);
            }
        });

        this.formatter.postFormat();
    }
}