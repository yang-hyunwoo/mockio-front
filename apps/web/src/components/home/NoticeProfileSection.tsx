import { NoticeCard } from "./NoticeCard"

type Props = {
    notice?: { title: string; body: string } | null
    right: React.ReactNode
}

export default function NoticeProfileSection({ notice, right }: Props) {
    return (
        <section className="grid gap-6 md:grid-cols-2">
            <NoticeCard notice={notice} />
            {right}
        </section>
    )
}