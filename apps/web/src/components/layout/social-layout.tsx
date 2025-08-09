"use client";

import { ReactNode } from "react";
import { SocialNav } from "./social-nav";
import { FloatingCreateButton } from "@/components/social/floating-create-button";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";

interface UserInfo {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface SocialLayoutProps {
  children: ReactNode;
}

export function SocialLayout({ children }: SocialLayoutProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  // Fetch current user info
  const { data: userInfo, isLoading } = api.user.getUserInfo.useQuery();

  // Transform the user data to match our interface
  const user: UserInfo | undefined = userInfo ? {
    id: userInfo.id,
    name: userInfo.name || userInfo.username || null,
    email: userInfo.email,
    image: userInfo.image || null,
  } : undefined;

  // Show loading state if user data is being fetched
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <SocialNav user={user} locale={locale} />
      <main className="flex-1">
        {children}
      </main>
      <FloatingCreateButton />
    </div>
  );
}