import { create } from "zustand"

type AuthState = {
    accessToken: string | null
    user: {
        id: number
        email: string
        nickname: string
    } | null
    isInitialized: boolean

    setAccessToken: (token: string | null) => void
    setUser: (user: any) => void
    setInitialized: (v: boolean) => void
    clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    user: null,
    isInitialized: false,

    setAccessToken: (token) => set({ accessToken: token }),
    setUser: (user) => set({ user }),
    setInitialized: (v) => set({ isInitialized: v }),

    clearAuth: () =>
        set({
            accessToken: null,
            user: null,
            isInitialized: true,
        }),
}))