"use client";

import { useParams } from "next/navigation";
import QuestionBoardForm from "@/components/questionboard/QuestionBoardForm";

export default function EditPage() {
    const params = useParams();
    const boardId = Number(params.id);

    return <QuestionBoardForm mode="edit" boardId={boardId} />;
}