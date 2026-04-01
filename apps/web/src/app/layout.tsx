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
    title: 'Mockio | AI 기반 모의면접 서비스',
    description: '직무 정보를 바탕으로 맞춤형 면접 질문을 생성하고 연습할 수 있는 서비스',
}

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