export default function HomeShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,var(--tint-mint),transparent_60%),radial-gradient(900px_500px_at_90%_10%,var(--tint-sky),transparent_55%),linear-gradient(180deg,var(--tint-cream),var(--tint-ice))] text-[var(--text-primary)]">
            <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 py-10 lg:py-14">
                {children}
            </main>
        </div>
    );
}