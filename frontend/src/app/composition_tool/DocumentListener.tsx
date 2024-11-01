import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://us-central1-l17-tune-tracer.cloudfunctions.net/socketServer");

interface DocumentListenerProps {
  docId: string;
}

export const DocumentListener: React.FC<DocumentListenerProps> = ({ docId }) => {
  const [documentData, setDocumentData] = useState(null);

  useEffect(() => {
    // Listen for updates for the specific document ID
    socket.on(`firestoreUpdate-${docId}`, (data) => {
      setDocumentData(data);
    });

    // Clean up the event listener when the component unmounts or docId changes
    return () => {
      socket.off(`firestoreUpdate-${docId}`);
    };
  }, [docId]); // Re-run effect if docId changes

  return (
    <div>
      {documentData ? (
        <div>{JSON.stringify(documentData)}</div>
      ) : (
        <p>No data available, docId={docId} </p>
      )}
    </div>
  );
};