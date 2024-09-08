import type { Document, FirebaseDocumentData, Comment } from '../document-utils/documentTypes'

// converts a Document to FirebaseDocumentData and returns the result
export function documentToData(document: Document) : FirebaseDocumentData
{
    const documentCopy = JSON.parse(JSON.stringify(document));
    const metadata = documentCopy.metadata;
    delete documentCopy['metadata'];
    const data : FirebaseDocumentData = {
        documentString: JSON.stringify(documentCopy),
        metadata: JSON.stringify(metadata)
    };
    return data;
}

// converts a FirebaseDocumentData object to a Document and returns the result
export function dataToDocument(data: FirebaseDocumentData) : Document
{
    const documentContent = JSON.parse(data.documentString);
    const document : Document = 
    {
        document_title: documentContent['document_title'],
        contents: documentContent['contents'],
        comments: documentContent['comments'] as Comment[],
        metadata: JSON.parse(data.metadata)
    };
    return document;
}