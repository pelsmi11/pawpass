"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export type DemoStatus = {
  databaseOutage: boolean;
  highLatency: boolean;
  latencyMs: number;
  updatedAt: string;
};

const fetchStatus = async (): Promise<DemoStatus> => {
  const res = await fetch("/api/demo/status");
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.errorCode || "Failed");
  return data.demo;
};

export const useDemoLab = () => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState("");

  const statusQuery = useQuery({
    queryKey: ["demoStatus"],
    queryFn: fetchStatus,
  });

  const outageMutation = useMutation({
    mutationFn: async (tokenParam: string) => {
      const res = await fetch("/api/demo/database-outage", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-demo-token": tokenParam },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw data;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demoStatus"] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (tokenParam: string) => {
      const res = await fetch("/api/demo/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-demo-token": tokenParam },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw data;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demoStatus"] });
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    },
  });

  return {
    token,
    setToken,
    status: statusQuery.data,
    isLoading: statusQuery.isLoading,
    isError: statusQuery.isError,
    refetch: statusQuery.refetch,
    activateOutage: (t?: string) => outageMutation.mutateAsync(t ?? token),
    resetLab: (t?: string) => resetMutation.mutateAsync(t ?? token),
    isActivating: outageMutation.isPending,
    isResetting: resetMutation.isPending,
    lastSupportId:
      (outageMutation.error as unknown as { supportId?: string })?.supportId ||
      (resetMutation.error as unknown as { supportId?: string })?.supportId ||
      null,
  };
};
