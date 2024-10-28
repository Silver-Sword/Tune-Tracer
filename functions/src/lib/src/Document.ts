import { getDefaultScoreData, ScoreData } from "./ScoreData";
import { Comment } from "./Comment";
import { DocumentMetadata } from "./documentProperties";
import { SelectedNote } from "./SelectedNote";

// purpose: for storing and representing a Composition Document
export type Document =
{
    document_title: string,             // the title of the document; the label of the document used on the storage page
    comments: Comment[],                // comments; unusued
    score: ScoreData,                   // the contents of the composition
    metadata: DocumentMetadata,         // the document metadata; this should be treated as a CONST by the frontend
    selectedNotes: SelectedNote[]       // array of selected notes by all users, if any
};

export function getDefaultDocument(): Document {
    return {
        document_title: "",
        comments: [],
        score: getDefaultScoreData(),
        metadata: getDefaultMetadata(),
        selectedNotes: [],
    };
}