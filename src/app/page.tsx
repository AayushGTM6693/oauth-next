"use client";
import { Button } from "../../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import Image from "next/image";

export default function Home() {
  // auth hook lai linxa
  const { user, authenticated, loading, signIn, signOut } = useAuth();
  console.log("aako user", user);
  // 1st ma session check hunuparxa tyo bhanda agi lai, loading state
  if (loading) {
    return (
      <main className="flex h-full flex-col items-center justify-center">
        <div className="p-6 space-y-4">
          <h1 className="text-xl font-semibold"> Google OAuth Demo </h1>
          <p>Loading</p>
        </div>
      </main>
    );
  }
  // main ui
  return (
    <main className="flex h-full flex-col items-center justify-center">
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Google OAuth Demo</h1>
        {!authenticated ? (
          // show btn if auth xaina bhane
          <Button onClick={signIn}>Sign in with google</Button>
        ) : (
          <div className="space-y-2">
            <p>Welcome, {user?.name}</p>
            <Image
              src={user?.picture || ""}
              alt="avatar"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full"
            />
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
