import React from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface TutorialProps {
  run: boolean;            // Whether the tutorial is running
  stepIndex: number;       // Current step index
  onCallback: (data: CallBackProps) => void;  // Callback handler for step events
}

const tutorialSteps: Step[] = [
  { target: ".search-bar", content: "Search for compositions here." },
  { target: ".create-card", content: "Create a new score or join with a code." },
  { target: ".navbar-filters", content: "Filter compositions here." },
  { target: ".profile-menu", content: "Access your profile settings and log out here." },
];

const StorageTutorial: React.FC<TutorialProps> = ({ run, stepIndex, onCallback }) => {
  return (
    <Joyride
      steps={tutorialSteps}
      run={run}
      stepIndex={stepIndex}
      continuous
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

export default StorageTutorial;
