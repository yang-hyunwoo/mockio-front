import { api } from "@/lib/axios"
import { apiEndpoints } from "@/lib/api"

export async function InterviewExitApi(interviewId: number): Promise<boolean> {
    try {
        await api.patch(`${apiEndpoints.interview}/exit/${interviewId}`)
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}