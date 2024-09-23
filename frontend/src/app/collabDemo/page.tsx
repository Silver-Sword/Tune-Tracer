'use client'

import React, { useState, useEffect } from 'react';
import FirebaseWrapper from '../../backend/src/firebase-utils/FirebaseWrapper'
import { Document } from '../../lib/documentTypes'
import { subscribeToDocumentUpdates } from '../../backend/src/document-utils/realtimeDocumentUpdates'
import { updateDocument } from '../../backend/src/document-utils/documentOperations'

export default function collabDemo() {
    const [isLoading, setIsLoading] = useState(false);
    const ethicalID = "niK5UsqxhL4i9TGd0twT";
    const [documentTitle, setDocumentTitle] = useState('Hello'); // Use React state for the document title
    const [documentTemp, setDocumentTemp] = useState<Document>();
    const [firebase, firebaseinit] = useState(null);

    async function StartButton () {
        setIsLoading(true);
        const firebaseW = new FirebaseWrapper();

        await firebaseW.initApp();
        // firebaseinit(firebaseW);

        let realTemp = (await firebaseW.getDocument(ethicalID)) as Document;

        setDocumentTemp(realTemp);

        // if(documentTemp == null || documentTemp == undefined)
        // {
        //     throw Error(`Null document`);
        // }

        // console.log(`documentTemp=
        //     ${documentTemp ? JSON.stringify(documentTemp) : "null"}`
        // );
        // setDocumentTitle(documentTemp?.document_title);

        if (realTemp == null || realTemp == undefined) {
            throw Error('Document is null');
        }

        console.log(`documentTemp= ${documentTemp ? JSON.stringify(documentTemp) : "null"}`);
        setDocumentTitle(realTemp.document_title);

        subscribeToDocumentUpdates(ethicalID, (updatedDocument: Document) => {
            console.log(`Detected changes in document ${ethicalID}`);
            setDocumentTitle(updatedDocument.document_title);
            setDocumentTemp(updatedDocument); // update the temp document with new changes
            updateDocument(updatedDocument);
        });
        
        setIsLoading(false);
    };

    async function Changes (event: React.ChangeEvent<HTMLTextAreaElement>) {
        const updated = event.target.value as string;
        if (documentTemp == null || documentTemp == undefined) {
            throw Error('Document is null');
        }
        var updatedDocument = documentTemp as Document;
        console.log(`Trying to update with title=${updated}`);
        updatedDocument.document_title = updated;
        setDocumentTemp(updatedDocument);
        // await updateDocument(documentTemp);
        setDocumentTitle(updated);
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
