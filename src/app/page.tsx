import { PawpassHero } from "@/components/pawpass-hero";
import { SiteHeader } from "@/components/site-header";
import { StatusCard } from "@/components/status-card";

/**
 * Home page placeholder for PawPass.
 * Composes warm, friendly placeholders without business logic.
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6">
        <PawpassHero />
        <StatusCard />
      </main>
    </div>
  );
}
