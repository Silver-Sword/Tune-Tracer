import { CompositionData } from "./CompToolData";
import { Comment } from "./Comment";
import { DocumentMetadata } from "./documentProperties";

// purpose: for storing and representing a Composition Document
export type Document =
{
    document_title: string,             // the title of the document; the label of the document used on the storage page
    comments: Comment[],                // comments; unusued
    composition: CompositionData,       // the contents of the composition
    metadata: DocumentMetadata,         // the document metadata; this should be treated as a CONST by the frontend
};