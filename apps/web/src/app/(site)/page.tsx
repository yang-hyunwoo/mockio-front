import HeroSection from "@/components/home/HeroSection";
import StartCard from "@/components/home/StartCard";
import PreviewSection from "@/components/home/PreviewSection";
import NoticeProfileSection from "@/components/home/NoticeProfileSection";
import { getNotice } from "@/lib/api/home/noticeApi";
import {ProfileCard} from "@/components/home/ProfileCard";
import { cookies } from "next/headers";
export default async function Home() {
    const cookieStore = await cookies();
    const session = cookieStore.get("MOCKIO_SESSION");
    const isLogin = !!session?.value;
    const notice = await getNotice();

  return (
    <>
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <HeroSection />
          <StartCard isLogin={isLogin}/>
        </section>

        <PreviewSection />
          <NoticeProfileSection notice={notice}
                                right={<ProfileCard isLogin={isLogin} />}/>
    </>
  );
}
