import Image from "next/image";
import Link from "next/link";

export default function HomeHeader() {
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

                    <div className="relative group">
                        <button type="button"
                                className="inline-flex items-center
                                gap-2 text-(--brand-muted)
                                transition-colors hover:text-foreground"
                        >
                            내 정보
                            <span className="text-[10px]
                            opacity-70
                            transition-transform
                            group-hover:rotate-180">▾</span>
                        </button>

                        <div className="absolute left-0 top-full hidden pt-3 z-50 group-hover:block">
                            <div className="min-w-47.5
                                    overflow-hidden
                                    rounded-2xl
                                    border border-white/30
                                    bg-white/65
                                    backdrop-blur-xl
                                    shadow-[0_18px_40px_rgba(20,30,50,0.18)]"
                            >
                                <a href="/settings"
                                   className="block
                                              px-4
                                              py-3
                                              text-sm
                                              transition-colors
                                              hover:bg-white/50"
                                >
                                    내 정보 1
                                    <span className="mt-1 block text-xs text-gray-500">
                                      프로필 / 기본 정보
                                    </span>
                                </a>

                                <div className="h-px bg-black/3"/>

                                <a href="/settings"
                                   className="block
                                              px-4
                                              py-3
                                              text-sm
                                              transition-colors hover:bg-white/50">
                                    내 정보 2
                                    <span className="mt-1 block text-xs text-gray-500">
                                        환경설정 / 보안
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>

            <div className="flex items-center gap-3">
                <a href="#preview"
                   className="inline-flex
                               h-10
                               items-center
                               rounded-full
                               border border-(--border-soft)
                               px-4
                               text-sm
                               font-medium text-(--brand-secondary)
                               transition-colors hover:border-(--brand-secondary)
                               hover:bg-(--surface-glass)"
                >
                    게스트 미리보기
                </a>
                <a href="#start"
                   className="inline-flex
                               h-10
                               items-center
                               rounded-full
                               bg-(--brand-primary)
                               px-4
                               text-sm
                               font-semibold
                               text-white
                               transition-colors
                               hover:bg-(--brand-primary-hover)"
                >
                    면접 시작
                </a>
            </div>
        </header>
    );
}