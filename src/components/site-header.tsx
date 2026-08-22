import { Badge } from "@/components/ui/badge";

/**
 * Site header for PawPass.
 * Warm, friendly and trustworthy - uses stone base and primary warm token.
 */
export function SiteHeader() {
  return (
    <header className="flex items-center justify-between border-b bg-card px-6 py-4">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold tracking-tight text-foreground">
          PawPass
        </span>
        <Badge variant="secondary">Warm & trusted</Badge>
      </div>
      <Badge variant="outline" className="bg-info text-info-foreground">
        Info
      </Badge>
    </header>
  );
}
