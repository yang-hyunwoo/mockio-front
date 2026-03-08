"use client";

function dispatchLoadingEvent(name: string) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event(name));
}

export function startGlobalLoading() {
    dispatchLoadingEvent("global-loading:start");
}

export function endGlobalLoading() {
    dispatchLoadingEvent("global-loading:end");
}

export function resetGlobalLoading() {
    dispatchLoadingEvent("global-loading:reset");
}