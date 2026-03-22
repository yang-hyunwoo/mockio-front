import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import SignupSuccessClient from "@/components/login/SignupSuccessClient"

export default async function SignupSuccessPage() {
    const cookieStore = await cookies()
    const joinSuccess = cookieStore.get("join_success")?.value

    if (joinSuccess !== "success") {
        redirect("/login")
    }

    return <SignupSuccessClient />
}