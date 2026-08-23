"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDemoLab } from "@/hooks/useDemoLab";

type PendingAction = "outage" | "reset" | null;

export const DemoLabPanel = () => {
  const t = useTranslations("DemoLab");
  const tCommon = useTranslations("Common");
  const { token, setToken, status, isLoading, isError, activateOutage, resetLab, isActivating, isResetting, lastSupportId } =
    useDemoLab();
  const [copied, setCopied] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const executePending = async () => {
    const action = pendingAction;
    setPendingAction(null);
    if (!action) return;
    setLocalError(null);
    try {
      if (action === "outage") {
        await activateOutage(token);
      } else {
        await resetLab(token);
      }
    } catch (e) {
      const err = e as { errorCode?: string; supportId?: string };
      setLocalError(err.supportId ? `${err.errorCode ?? "Error"} — ${t("supportCode", { code: err.supportId })}` : String(e));
    }
  };

  return (
    <section id="demo-lab" aria-labelledby="demo-lab-heading" className="scroll-mt-20">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle id="demo-lab-heading" className="text-lg">
            {t("title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div aria-live="polite" className="rounded-lg bg-secondary/60 p-3 text-sm">
            {isLoading ? (
              <span>{t("loading")}</span>
            ) : isError ? (
              <span>{t("error")}</span>
            ) : status ? (
              <ul className="space-y-1">
                <li>
                  {t("databaseOutage")}:{" "}
                  <Badge variant={status.databaseOutage ? "destructive" : "secondary"}>
                    {status.databaseOutage ? t("outageActive") : t("outageInactive")}
                  </Badge>
                </li>
                <li>
                  {t("highLatency")}: {String(status.highLatency)}
                </li>
                <li>
                  {t("latencyMs")}: {status.latencyMs}
                </li>
              </ul>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="demo-token">{t("tokenLabel")}</Label>
            <div className="flex gap-2">
              <Input
                id="demo-token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={t("tokenPlaceholder")}
                autoComplete="off"
              />
              <Button type="button" variant="outline" onClick={() => setToken("")}>
                {t("clear")}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setPendingAction("outage")} disabled={isActivating || isResetting}>
              {t("activate")}
            </Button>
            <Button type="button" variant="outline" onClick={() => setPendingAction("reset")} disabled={isActivating || isResetting}>
              {t("reset")}
            </Button>
          </div>

          {localError && (
            <p role="alert" className="text-sm text-destructive">
              {localError}
            </p>
          )}

          {lastSupportId && (
            <p className="flex items-center gap-2 text-sm" aria-live="polite">
              <span>{t("supportCode", { code: lastSupportId })}</span>
              <Button type="button" size="sm" variant="ghost" onClick={() => handleCopy(lastSupportId)}>
                {copied ? t("copied") : t("copy")}
              </Button>
            </p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={pendingAction !== null} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingAction === "outage" ? t("confirmOutageTitle") : t("confirmResetTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === "outage" ? t("confirmOutage") : t("confirmReset")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingAction(null)}>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={executePending}>{tCommon("accept")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
