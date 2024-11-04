import React from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface TutorialProps {
  run: boolean;            // Whether the tutorial is running
  onCallback: (data: CallBackProps) => void;  // Callback handler for step events
}

const tutorialSteps: Step[] = [
  { target: ".editable-title", content: "Click here to edit the title of your composition." },
  { target: ".tabs", content: "Navigate between note and measure tools." },
  { target: ".toolbar", content: "You can find your composing tools here from note durations, ties, and accidentals." },
  { target: ".playback", content: "Listen to your composition using our playback tools." },
  { target: ".keybinds", content: "Stuck on keybinds? No problem, supported keybinds are made visible here." },
  { target: ".share-button", content: "Share your masterpiece here." },
  { target: ".tutorial-button", content: "Click here to view the tutorial again." },
];

const EditorTutorial: React.FC<TutorialProps> = ({ run, onCallback }) => {
  return (
    <Joyride
      steps={tutorialSteps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={onCallback}
      styles={{
        options: {
          primaryColor: "#1DA1F2",
          textColor: "#333",
          arrowColor: "#fff",
          backgroundColor: "#fff",
          zIndex: 1000,
        },
      }}
    />
  );
};

export default EditorTutorial;
