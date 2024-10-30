import React, { Suspense } from "react";
import CompositionTool from './CompositionTool';

export default function CompositionToolPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CompositionTool />
        </Suspense>
    )
}