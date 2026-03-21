import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Common/Button";
import NotificationDropdown from "@/components/home/NotificationDropdown";

export default function HomeHeader({ isLogin }: { isLogin: boolean }) {
    return (
        <header className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div>
                    <Link href="/" className="inline-flex items-center">
                        <Image
                            src="/branding/mockio-text-logo.png"
                            alt="Mockio"
                            width={120}
                            height={24}
                            priority
                        />
                    </Link>
                </div>

                <nav className="hidden items-center gap-5 text-sm font-medium lg:flex">
                    <Link
                        href="/notice"
                        className="text-(--brand-muted) transition-colors hover:text-foreground"
                    >
                        공지사항
                    </Link>

                    <Link
                        href="/faq"
                        className="text-(--brand-muted) transition-colors hover:text-foreground"
                    >
                        FAQ
                    </Link>

                    {isLogin && (
                        <>
                            <div className="relative group">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto px-0 font-medium text-(--brand-muted) hover:text-foreground"
                                    rightIcon={
                                        <span className="text-[10px] opacity-70 transition-transform group-hover:rotate-180">
                                            ▾
                                        </span>
                                    }
                                >
                                    AI 면접
                                </Button>

                                <div className="absolute left-0 top-full z-50 hidden pt-3 group-hover:block">
                                    <div
                                        className="min-w-55 overflow-hidden rounded-2xl border border-white/30
                                                   bg-white/65 shadow-[0_18px_40px_rgba(20,30,50,0.18)] backdrop-blur-xl"
                                    >
                                        <Link
                                            href="/interview"
                                            className="block px-4 py-3 text-sm transition-colors hover:bg-white/50"
                                        >
                                            면접 시작
                                            <p className="mt-1 text-xs text-gray-500">
                                                새로운 AI 면접을 시작합니다
                                            </p>
                                        </Link>

                                        <div className="h-px bg-black/5" />

                                        <Link
                                            href="/interview/history"
                                            className="block px-4 py-3 text-sm transition-colors hover:bg-white/50"
                                        >
                                            면접 기록
                                            <p className="mt-1 block text-xs text-gray-500">
                                                이전 면접 결과와 진행 내역을 확인합니다
                                            </p>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group">
                                <Link
                                    // href="/mypage"
                                    href="/mypage/interview/history"
                                    className="text-(--brand-muted) transition-colors hover:text-foreground"
                                >
                                    내 정보
                                </Link>
                            </div>
                        </>
                    )}
                </nav>
            </div>

            <div className="flex items-center gap-6">
                {isLogin ? (
                    <>
                        <NotificationDropdown />
                        <Link
                            href="/interview"
                            className="inline-flex h-10 items-center rounded-full bg-(--brand-primary) px-4 text-sm font-semibold text-white transition-colors hover:bg-(--brand-primary-hover)"
                        >
                            면접 시작
                        </Link>
                    </>
                ) : (
                    <Link
                        href="/preview"
                        className="inline-flex h-10 items-center rounded-full border border-(--border-soft) px-4 text-sm font-medium text-(--brand-secondary) transition-colors hover:border-(--brand-secondary) hover:bg-(--surface-glass)"
                    >
                        게스트 미리보기
                    </Link>
                )}
            </div>
        </header>
    );
}