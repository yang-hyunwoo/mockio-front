import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";


export async function TerminateInterviewApi(): Promise<boolean> {
    const endpoints = getClientApiEndpoints();

    try {
        await api.patch(`${endpoints.interview}/exit`)
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}
