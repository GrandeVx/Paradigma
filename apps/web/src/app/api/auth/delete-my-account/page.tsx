"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

import { api } from "@/trpc/react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
// We need to use the service role key to have the admin role for the supabase client
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);
export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const deleteUserAccount = api.user.deleteAccount.useMutation();

  const handleRemoveAccount = async () => {
    await deleteUserAccount.mutateAsync().then(async (data) => {
      if (!data) {
        toast({
          variant: "destructive",
          title: "Account non rimosso",
          description: "Si è verificato un errore, riprova più tardi",
        });
        return;
      } else {
        await supabase.auth.signOut().then(() => {
          toast({
            variant: "default",
            title: "Account Rimosso",
            description: "Il tuo account è stato rimosso con successo",
          });
        });
      }
    });
  };

  const handleSubmit = async (e: unknown) => {
    // @ts-expect-error - TS doesn't know e.preventDefault
    e.preventDefault();
    await supabase.auth
      .signInWithPassword({
        email,
        password,
      })
      .then(async (data) => {
        if (!data.data.session) {
          toast({
            variant: "destructive",
            title: "Login Fallito",
            description: "Controlla le credenziali e riprova",
          });
        } else {
          const token = data.data.session.access_token;
          document.cookie = `sb-tmp-auth-token=${encodeURIComponent(token)}; path=/;`;
          await handleRemoveAccount()
            .then(() => {
              // clear the cookie
              document.cookie = `sb-tmp-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
  };

  return (
    <div
      className="bg-background flex h-screen items-center justify-center"
      data-oid="3nku.kq"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg"
        data-oid="vhhxg2y"
      >
        <h2
          className="mt-6 text-center text-lg font-normal text-gray-900"
          data-oid="9qon5a."
        >
          Rimuovi il tuo Account
        </h2>
        <p className="text-center text-sm" data-oid="966j-jf">
          Sei sicuro di voler rimuovere il tuo account? Questa azione è
          irreversibile, una volta effettuato il login procederemo con la
          cancellazione del tuo account in modo permanente.
        </p>
        <div className="space-y-4" data-oid="65nb3-e">
          <div data-oid="1wh70fo">
            <Label htmlFor="email" data-oid="j.t-340">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              className="bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-oid="b1img0g"
            />
          </div>
          <div data-oid="zzum2-j">
            <Label htmlFor="password" data-oid="_sy__.u">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="Nuova password"
              className="bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-oid="sz.lram"
            />
          </div>
          <div
            className="flex items-center justify-between"
            data-oid="v-7wph9"
          ></div>
          <Button
            disabled={email === "" || password === ""}
            className="bg-foreground disabled:bg-background w-full rounded-xl "
            type="submit"
            data-oid="ywm-cnp"
          >
            {deleteUserAccount.isLoading
              ? "Rimozione in corso..."
              : "Rimuovi Account"}
          </Button>
        </div>
      </form>
    </div>
  );
}
