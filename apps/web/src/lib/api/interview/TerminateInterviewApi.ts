import { api } from "@/lib/axios"
import { apiEndpoints } from "@/lib/api"

export async function TerminateInterviewApi(): Promise<boolean> {
    try {
        await api.patch(`${apiEndpoints.interview}/exit`)
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}
