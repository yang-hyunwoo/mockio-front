import { api } from "@/lib/axios"
import { getClientApiEndpoints } from "@/lib/api"

export type SttResponse = {
    text: string
}

export async function InterviewSttApi(
    file: File,
    interviewId: number
): Promise<SttResponse | null> {
    const endpoints = getClientApiEndpoints()

    try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("interviewId", String(interviewId))

        const response = await api.post(
            `${endpoints.interview}/answer/stt`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        )

        return response.data.data ?? null
    } catch (error) {
        console.error("InterviewSttApi error:", error)
        return null
    }
}