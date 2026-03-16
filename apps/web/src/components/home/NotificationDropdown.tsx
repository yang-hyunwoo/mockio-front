"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { NotificationApi } from "@/lib/api/home/NotificationApi";
import { NotificationResponse } from "@mockio/shared/src/api/home/NotificationResponse";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { NotificationReadApi } from "@/lib/api/home/NotificationReadApi";
import { NotificationReadAllApi } from "@/lib/api/home/NotificationReadAllApi";

dayjs.extend(relativeTime);
dayjs.locale("ko");

export const formatTimeAgo = (date: string) => {
    return dayjs(date).fromNow();
};

interface NotificationItem {
    id: number;
    title: string;
    content: string;
    link?: string | null;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            const result = await NotificationApi();

            if (!result) {
                setNotifications([]);
                setUnreadCount(0);
                setHasNext(false);
                return;
            }

            const mappedNotifications: NotificationItem[] = result.notifications.map(
                (item: NotificationResponse) => ({
                    id: item.id,
                    title: item.title,
                    content: item.content,
                    link: item.link,
                    isRead: item.isRead,
                    createdAt: item.createdAt,
                })
            );

            setNotifications(mappedNotifications);
            setUnreadCount(result.unreadCount);
            setHasNext(result.hasNext);
        };

        fetchNotifications();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleNotificationClick = async (item: NotificationItem) => {
        setOpen(false);

        if (item.isRead) {
            return;
        }

        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === item.id
                    ? { ...notification, isRead: true }
                    : notification
            )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));

        const success = await NotificationReadApi(item.id);

        if (!success) {
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === item.id
                        ? { ...notification, isRead: false }
                        : notification
                )
            );
            setUnreadCount((prev) => prev + 1);
        }
    };

    const handleReadAll = async () => {
        if (unreadCount === 0) return;

        const prevNotifications = notifications;
        const prevUnreadCount = unreadCount;

        // optimistic update
        setNotifications((prev) =>
            prev.map((item) => ({ ...item, isRead: true }))
        );
        setUnreadCount(0);

        const success = await NotificationReadAllApi();

        if (!success) {
            setNotifications(prevNotifications);
            setUnreadCount(prevUnreadCount);
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-foreground transition-colors hover:text-(--brand-primary)"
                aria-label="알림"
            >
                <Bell className="h-5 w-5" />

                {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-3 w-90 overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-[0_18px_40px_rgba(20,30,50,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/85">
                    <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/10">
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                알림
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                읽지 않은 알림 {unreadCount}개
                            </p>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleReadAll}
                                className="text-xs font-medium text-(--brand-primary) hover:underline"
                            >
                                모두 읽음
                            </button>
                        )}
                    </div>

                    <div className="max-h-90 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-10 text-center">
                                <p className="text-sm font-medium text-foreground">
                                    새로운 알림이 없습니다.
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    새 소식이 생기면 여기 표시됩니다.
                                </p>
                            </div>
                        ) : (
                            notifications.map((item) => {
                                const hasLink = !!item.link?.trim();

                                const content = (
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`mt-1 h-2.5 w-2.5 rounded-full ${
                                                item.isRead
                                                    ? "bg-gray-300 dark:bg-gray-600"
                                                    : "bg-(--brand-primary)"
                                            }`}
                                        />

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                                {item.title}
                                            </p>
                                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600 dark:text-gray-300">
                                                {item.content}
                                            </p>
                                            <p className="mt-2 text-[11px] text-gray-400">
                                                {formatTimeAgo(item.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                );

                                const commonClassName = `block w-full border-b border-black/5 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-white/60 dark:border-white/10 dark:hover:bg-white/5 ${
                                    !item.isRead
                                        ? "bg-blue-50/70 dark:bg-blue-500/10"
                                        : ""
                                }`;

                                if (hasLink) {
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.link!.trim()}
                                            className={commonClassName}
                                            onClick={() => handleNotificationClick(item)}
                                        >
                                            {content}
                                        </Link>
                                    );
                                }

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={commonClassName}
                                        onClick={() => handleNotificationClick(item)}
                                    >
                                        {content}
                                    </button>
                                );
                            })
                        )}
                    </div>
                    {/*TODO : 추후 전체 알림 페이지 추가 하기*/}
                    {/*<div className="border-t border-black/5 px-4 py-3 dark:border-white/10">*/}
                    {/*    <Link*/}
                    {/*        href="/notifications"*/}
                    {/*        className="block text-center text-sm font-medium text-(--brand-primary) hover:underline"*/}
                    {/*        onClick={() => setOpen(false)}*/}
                    {/*    >*/}
                    {/*        전체 알림 보기*/}
                    {/*        {hasNext ? " +" : ""}*/}
                    {/*    </Link>*/}
                    {/*</div>*/}
                </div>
            )}
        </div>
    );
}