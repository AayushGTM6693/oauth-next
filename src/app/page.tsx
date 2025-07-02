"use client";
import { Button } from "../../components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();
  return (
    <main className="flex h-full flex-col items-center justify-center">
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Google OAuth Demo</h1>
        {!session ? (
          <Button onClick={() => signIn("google")}>Sign in with google</Button>
        ) : (
          <div className="space-y-2">
            <p>Welcome, {session.user?.name}</p>
            <Image
              src={session.user?.image || ""}
              alt="avatar"
              width={48}
              height={48}
              className="w-12. rounded-full"
            />
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
