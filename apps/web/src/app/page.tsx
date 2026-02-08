import HomeShell from "@/components/home/HomeShell";
import HomeHeader from "@/components/home/HomeHeader";
import HeroSection from "@/components/home/HeroSection";
import StartCard from "@/components/home/StartCard";
import PreviewSection from "@/components/home/PreviewSection";
import NoticeProfileSection from "@/components/home/NoticeProfileSection";
import { getNotice } from "@/lib/home/notice";

export default async function Home() {
  const notice = await getNotice();

  return (
      <HomeShell>
        <HomeHeader />

        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <HeroSection />
          <StartCard />
        </section>

        <PreviewSection />
        <NoticeProfileSection notice={notice} />
      </HomeShell>
  );
}
