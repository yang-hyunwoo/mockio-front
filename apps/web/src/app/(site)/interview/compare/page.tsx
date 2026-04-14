import { Suspense } from "react"
import InterviewCompareClient from "./InterviewCompareClient"

export default function InterviewComparePage() {
    return (
        <Suspense fallback={<div className="p-6">불러오는 중...</div>}>
            <InterviewCompareClient />
        </Suspense>
    )
}

