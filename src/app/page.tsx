import { PawpassHero } from "@/components/pawpass-hero";
import { PetForm } from "@/components/pet-form";
import { PetList } from "@/components/pet-list";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { StatusCard } from "@/components/status-card";

/**
 * Home page for PawPass.
 * Composes header, hero, registration form, pet list and footer.
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14"
      >
        <PawpassHero />
        <Providers>
          <div className="mx-auto mt-12 grid w-full max-w-5xl gap-8 sm:mt-16 lg:grid-cols-2">
            <PetForm />
            <PetList />
          </div>
        </Providers>
        <div className="mx-auto mt-12 w-full max-w-2xl sm:mt-16">
          <StatusCard />
        </div>
      </main>
      <footer className="border-t border-border/60 py-6">
        <p className="mx-auto w-full max-w-6xl px-4 text-sm text-muted-foreground sm:px-6">
          © 2026 · Made with care for pets and their people.
        </p>
      </footer>
    </div>
  );
}
