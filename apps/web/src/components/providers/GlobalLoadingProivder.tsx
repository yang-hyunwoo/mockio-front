"use client";

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

type LoadingType = "top" | "center";

type GlobalLoadingContextValue = {
    isTopLoading: boolean;
    isCenterLoading: boolean;
    topPendingCount: number;
    centerPendingCount: number;
};

const GlobalLoadingContext = createContext<GlobalLoadingContextValue | null>(null);

export function GlobalLoadingProvider({
                                          children,
                                      }: {
    children: React.ReactNode;
}) {
    const [topPendingCount, setTopPendingCount] = useState(0);
    const [centerPendingCount, setCenterPendingCount] = useState(0);

    useEffect(() => {
        const handleStart = (event: Event) => {
            const customEvent = event as CustomEvent<{ type?: LoadingType }>;
            const type = customEvent.detail?.type;

            if (type === "center") {
                setCenterPendingCount((prev) => prev + 1);
                return;
            }

            setTopPendingCount((prev) => prev + 1);
        };

        const handleEnd = (event: Event) => {
            const customEvent = event as CustomEvent<{ type?: LoadingType }>;
            const type = customEvent.detail?.type;

            if (type === "center") {
                setCenterPendingCount((prev) => Math.max(0, prev - 1));
                return;
            }

            setTopPendingCount((prev) => Math.max(0, prev - 1));
        };

        window.addEventListener("global-loading:start", handleStart);
        window.addEventListener("global-loading:end", handleEnd);

        return () => {
            window.removeEventListener("global-loading:start", handleStart);
            window.removeEventListener("global-loading:end", handleEnd);
        };
    }, []);

    const value = useMemo(
        () => ({
            isTopLoading: topPendingCount > 0,
            isCenterLoading: centerPendingCount > 0,
            topPendingCount,
            centerPendingCount,
        }),
        [topPendingCount, centerPendingCount]
    );

    return (
        <GlobalLoadingContext.Provider value={value}>
            {children}
        </GlobalLoadingContext.Provider>
    );
}

export function useGlobalLoading() {
    const context = useContext(GlobalLoadingContext);

    if (!context) {
        throw new Error("useGlobalLoading must be used within GlobalLoadingProvider");
    }

    return context;
}
