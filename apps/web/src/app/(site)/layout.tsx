import HomeShell from "@/components/home/HomeShell";
import HomeHeader from "@/components/home/HomeHeader";

export default function SiteLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <HomeShell>
            <HomeHeader />
            {children}
        </HomeShell>
    );
}