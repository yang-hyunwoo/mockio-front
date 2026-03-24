import HomeShell from "@/components/home/HomeShell";
import HomeHeader from "@/components/home/HomeHeader";
import {cookies} from "next/headers";

export default async function SiteLayout({children,}: { children: React.ReactNode; }) {
    const cookieStore = await cookies();
    const session = cookieStore.get("MOCKIO_SESSION");
    const isLogin = !!session?.value;
    return (
        <HomeShell>
            <HomeHeader />
            {children}
        </HomeShell>
    );
};