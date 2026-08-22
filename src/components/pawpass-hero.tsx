import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Hero section for PawPass.
 * Demonstrates warm palette, primary button and semantic badges.
 */
export function PawpassHero() {
  return (
    <section className="space-y-6 rounded-lg border bg-card p-8 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Caring close to your pets
        </h1>
        <p className="max-w-prose text-muted-foreground">
          A friendly and trustworthy registry for your companions. Warm, calm and
          pet-friendly — never childish.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button>Register a pet</Button>
        <Button variant="outline">View pets</Button>
        <Badge className="bg-success text-success-foreground">Success</Badge>
        <Badge className="bg-warning text-warning-foreground">Warning</Badge>
        <Badge className="bg-info text-info-foreground">Info</Badge>
        <Badge variant="destructive">Error</Badge>
        <Badge variant="outline" className="opacity-50">
          Disabled
        </Badge>
      </div>

      <Alert>
        <AlertTitle>Welcome</AlertTitle>
        <AlertDescription>
          This is a static placeholder. No business logic is implemented yet.
        </AlertDescription>
      </Alert>
    </section>
  );
}
