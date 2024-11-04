import React from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface TutorialProps {
  run: boolean;            // Whether the tutorial is running
  onCallback: (data: CallBackProps) => void;  // Callback handler for step events
}

const tutorialSteps: Step[] = [
  { target: ".score", content: "does this work" },
  { target: ".share-button", content: "Share your masterpiece here." },
//   { target: ".navbar-filters", content: "Filter compositions here." },
//   { target: ".profile-menu", content: "Access your profile settings and log out here." },
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
