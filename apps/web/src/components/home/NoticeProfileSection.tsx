import { NoticeCard } from "./NoticeCard";
import { ProfileCard } from "./ProfileCard";

type Props = {
    notice?: {
        title: string;
        body: string;
    } | null;
};

export default function NoticeProfileSection({ notice }: Props) {
    return (
        <section className="grid gap-6 md:grid-cols-2">
            <NoticeCard notice={notice} />
            <ProfileCard />
        </section>
    );
}