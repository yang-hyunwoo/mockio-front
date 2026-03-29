import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalLoadingProvider } from "@/components/providers/GlobalLoadingProivder";
import GlobalTopLoadingBar from "@/components/Common/GlobalTopLoadingBar";
import GlobalCenterLoading from "@/components/Common/GlobalCenterLoading";
import AuthInitializer from "@/app/AuthInitializer";
import { Providers } from "@/providers/Providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Mockio",
    description: "모의 면접",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Providers>
                    <AuthInitializer>
                        <GlobalLoadingProvider>
                            <GlobalTopLoadingBar />
                            <GlobalCenterLoading />
                            {children}
                        </GlobalLoadingProvider>
                    </AuthInitializer>
                </Providers>
            </body>
        </html>
    );
}