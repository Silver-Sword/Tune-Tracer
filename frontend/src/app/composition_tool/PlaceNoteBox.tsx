import { IconLetterA } from "@tabler/icons-react";
import { Score } from "../edit/Score";
import { Measure } from "../edit/Measure";
import * as d3 from 'd3';
import { Selection } from 'd3';
import { Vex, StaveNote, Formatter} from 'vexflow';

const SNAP_INTERVAL = 5;

export function createPlaceNoteBox(note: StaveNote): SVGElement {
     // Add a custom SVG rectangle outline as an overlay
     let noteBox = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
    );
    noteBox.setAttribute("x", note.getBoundingBox().getX()+""); // Position x-coordinate
    let stave = note.getStave();
    if(!stave) return noteBox;
    noteBox.setAttribute("y", (stave.getBoundingBox().getY() - 60) + ""); // Position y-coordinate
    noteBox.setAttribute("width", "20"); // Width of the rectangle
    noteBox.setAttribute("height", "250"); // Height of the rectangle
    noteBox.setAttribute("fill", "rgba(0, 0, 255, 0.0)"); // No fill color
    noteBox.setAttribute("stroke", "blue"); // Outline color
    noteBox.setAttribute("stroke-width", "2"); // Outline thickness

    return noteBox;
}

function getTrebleMap(): Map<number,string>
{
    const map1 = new Map();
    const notes1 = ["g", "f", "e", "d", "c", "b", "a"];
    let octave1 = 7;
    let interval1 = 1;

    for (let i = 0; i < 41; i++) {
      // 41 intervals from "g/7" to "d/2"
      const note = notes1[i % notes1.length];
      if (note === "b") {
        octave1--; // Decrease octave after reaching "b"
      }
      map1.set(interval1++, `${note}/${octave1}`);
    }
    return map1;
}

function getBassMap(): Map<number,string>
{
    const map2 = new Map();
    const notes2 = ["b", "a", "g", "f", "e", "d", "c"];
    let octave2 = 5;
    let interval2 = 1;
    
    for (let i = 0; i < 48; i++) { // 48 intervals from "b/5" to "a/0"
        const note = notes2[i % notes2.length];
        map2.set(interval2++, `${note}/${octave2}`);
        
        if (note === "c") {
            octave2--; // Decrease octave after reaching "c"
        }
    }
    return map2;
}

export function attachMouseMoveListener(selection: Selection<SVGElement, unknown, null, undefined>, note: StaveNote, measure: Measure) {
    let snapToKeyMap;
    if(measure.getClef() == "treble")
    {
        snapToKeyMap = getTrebleMap();
    }
    else 
    {
        snapToKeyMap = getBassMap();
    }
    // Event listener for mouse move within the box
    selection.on("mousemove", function (event) {
      const mouseY = d3.pointer(event)[1];
      const snapIndex = Math.floor(mouseY / SNAP_INTERVAL);
      
      let keys = note.getKeys();
      let addKey = snapToKeyMap.get(snapIndex);
      if (addKey === undefined) return;

      let newKey;
      if (keys.includes(addKey)) {
        newKey = note.getKeys();
      } else {
        newKey = note.getKeys().concat(addKey);
      }

      console.log("Adding key: " + addKey);
      console.log("index: " + snapIndex);

      let stave = note.getStave();
      if(!stave) return;

      let voice = note.getVoice();
      let context = note.getContext();

      voice.getTickables().forEach((tickable) => {
        tickable?.getSVGElement()?.remove();
      });

      measure.addNote([addKey],note.getAttribute('id'));
      measure.getVoice1().getTickables().forEach((tickable) =>{
        console.log(`Note: ${tickable} \n`);
      });

      new Formatter().formatToStave([measure.getVoice1()], stave);
      // Render the voice
      measure.getVoice1().draw(context, stave);

      //measure.removeNote([addKey],note.getAttribute('id'));

    });
}