"use client";

import ChangePasswordCard from "@/components/mypage/ChangePasswordCard";
import DeleteAccountCard from "@/components/mypage/DeleteAccountCard";

export default function MyPageAuthorizeSection() {
    return (
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <ChangePasswordCard/>
            <DeleteAccountCard />
        </div>
    );
}
