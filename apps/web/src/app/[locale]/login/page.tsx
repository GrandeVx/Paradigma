"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const { t, locale } = useTranslation();

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        router.push(`/${locale}/dashboard/home`);
        toast({
          title: t.auth.loginTitle,
          description: t.common.welcome,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t.auth.loginError,
        description: t.auth.loginError,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="bg-background flex h-screen items-center justify-center"
      data-oid="qb2-my."
    >
      <div
        className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg"
        data-oid="zhocg7l"
      >
        <h2
          className="mt-6 text-center text-2xl font-bold text-gray-900"
          data-oid="_rsc.e3"
        >
          {t.auth.loginTitle}
        </h2>
        <form onSubmit={handleSignIn} className="space-y-6" data-oid=":u0ue0a">
          <div data-oid="g9.zd.9">
            <Label htmlFor="email" data-oid="-lwhn_b">
              {t.auth.emailLabel}
            </Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="user@example.com"
              className="bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-oid="goyv17j"
            />
          </div>
          <div data-oid="c9w:8j2">
            <Label htmlFor="password" data-oid="8-.b-:z">
              {t.auth.passwordLabel}
            </Label>
            <Input
              id="password"
              type="password"
              name="password"
              className="bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-oid="5rcq0qw"
            />
          </div>
          <div className="flex items-center justify-between" data-oid="ixz.w2_">
            <Link
              href={`/${locale}/forgot-password`}
              className="text-sm text-black hover:underline"
              data-oid="70ame9e"
            >
              {t.auth.forgotPassword}
            </Link>
          </div>
          <Button
            type="submit"
            className="bg-foreground w-full rounded-xl"
            disabled={isLoading}
            data-oid="e40nfpt"
          >
            {isLoading ? "..." : t.auth.loginButton}
          </Button>
        </form>
        <div className="mt-4 text-center" data-oid="ss8bukc">
          <span className="text-sm" data-oid="d1va06m">
            {t.auth.noAccount}{" "}
          </span>
          <Link
            href={`/${locale}/signup`}
            className="text-sm text-black hover:underline"
            data-oid="-y8cg2m"
          >
            {t.auth.createAccount}
          </Link>
        </div>
      </div>
    </div>
  );
}
