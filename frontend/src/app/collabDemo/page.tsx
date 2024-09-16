'use client'

import React, { useState } from 'react';
import FirebaseWrapper from '../../../../backend/src/firebase-utils/FirebaseWrapper'
import { Document } from '../../../../lib/documentTypes'
import { subscribeToDocumentUpdates } from '../../../../backend/src/document-utils/realtimeDocumentUpdates'
import { updateDocument } from '../../../../backend/src/document-utils/documentOperations'

export default function collabDemo() {
    const [isLoading, setIsLoading] = useState(false);
    const ethicalID = "niK5UsqxhL4i9TGd0twT";
    const [text, setText] = useState('');
    var documentTemp : Document;
    const [documentTitle, setDocumentTitle] = useState(''); // Use React state for the document title

    async function StartButton () {
        setIsLoading(true);
        const firebase = new FirebaseWrapper();
        console.log("new wrapper");
        await firebase.initApp();
        console.log("initialized");
        documentTemp = await firebase.getDocument(ethicalID);
        console.log("hopeully have doc");
        documentTemp.document_title = "Testin"; 
        setDocumentTitle( "Testin");
        updateDocument(documentTemp);
        setIsLoading(false);
        return;
    };

    async function Changes (event: React.ChangeEvent<HTMLTextAreaElement>) {
        const updated = event.target.value;
        setDocumentTitle(updated);
        documentTemp.document_title = documentTitle;
        // await updateDocument(documentTemp);
        subscribeToDocumentUpdates(ethicalID, (updatedDocument: Document) => {
            console.log(`Detected changes in document ${ethicalID}`);
            documentTemp = updatedDocument;
            updateDocument(documentTemp);
        });
    };

    return (
        <div>
        <button onClick={StartButton} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Start'}
        </button>
        <div>
            <textarea
                onChange = {Changes}
                value = {documentTitle}
                placeholder = {documentTitle}
            />
            <textarea value = {documentTitle}
            />
        </div>
        </div>
    );
};
