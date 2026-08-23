import { BellRing, HeartHandshake, ShieldCheck } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { PAWPASS_HERO_CHECKUP_DATE } from "@/utils/constant";

export const usePawpassHero = () => {
  const t = useTranslations("Hero");
  const format = useFormatter();

  return {
    copy: {
      badge: t("badge"),
      title: t("title"),
      description: t("description"),
      register: t("register"),
      viewPets: t("viewPets"),
      goldenRetriever: t("goldenRetriever"),
      profileAge: t("profileAge", { age: 4 }),
      healthy: t("healthy"),
      nextCheckup: t("nextCheckup"),
      checkupDate: format.dateTime(PAWPASS_HERO_CHECKUP_DATE, {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
    },
    trustPoints: [
      { icon: ShieldCheck, label: t("verifiedRecords") },
      { icon: BellRing, label: t("careReminders") },
      { icon: HeartHandshake, label: t("trustedBySitters") },
    ],
    stats: [
      { term: t("visits"), value: format.number(14) },
      {
        term: t("weight"),
        value: format.number(28, {
          style: "unit",
          unit: "kilogram",
          unitDisplay: "short",
        }),
      },
      { term: t("vaccines"), value: t("upToDate") },
    ],
  };
};
