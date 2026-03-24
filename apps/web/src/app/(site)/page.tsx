import HeroSection from "@/components/home/HeroSection";
import StartCard from "@/components/home/StartCard";
import PreviewSection from "@/components/home/PreviewSection";
import NoticeProfileSection from "@/components/home/NoticeProfileSection";
import { getNotice } from "@/lib/api/home/noticeApi";
import {ProfileCard} from "@/components/home/ProfileCard";
export default async function Home() {
    const notice = await getNotice();
  return (
    <>
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <HeroSection />
          <StartCard/>
        </section>

        <PreviewSection />
          <NoticeProfileSection notice={notice}
                                right={<ProfileCard />}/>
    </>
  );
}
