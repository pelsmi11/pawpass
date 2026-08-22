import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Status card placeholder for PawPass.
 * Shows card, alert, skeleton and disabled input to demo tokens and primitives.
 */
export function StatusCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Recent pets
          <Badge className="bg-success text-success-foreground">Healthy</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-success/50 bg-success/10">
          <AlertTitle>All good</AlertTitle>
          <AlertDescription>No incidents — warm and reliable.</AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="placeholder-search">Search pets</Label>
          <Input
            id="placeholder-search"
            placeholder="Search by name"
            disabled
            value=""
          />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
