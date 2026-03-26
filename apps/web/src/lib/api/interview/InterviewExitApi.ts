import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";


export async function InterviewExitApi(interviewId: number): Promise<boolean> {
    const endpoints = getClientApiEndpoints();

    try {
        await api.patch(`${endpoints.interview}/exit/${interviewId}`)
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}
