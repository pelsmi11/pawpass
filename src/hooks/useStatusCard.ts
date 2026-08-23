import { useFormatter, useTranslations } from "next-intl";

import {
  STATUS_CARD_LAST_VISIT,
  STATUS_CARD_VACCINE_DUE,
} from "@/utils/constant";

export const useStatusCard = () => {
  const t = useTranslations("StatusCard");
  const format = useFormatter();
  const lastVisitDate = format.dateTime(STATUS_CARD_LAST_VISIT, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const dueDate = format.dateTime(STATUS_CARD_VACCINE_DUE, {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const pets = [
    {
      initials: "L",
      name: "Luna",
      detail: t("petDetail", {
        breed: t("goldenRetriever"),
        lastVisit: t("lastVisitToday"),
      }),
      status: t("healthy"),
      badgeClass: "bg-success text-success-foreground",
    },
    {
      initials: "M",
      name: "Milo",
      detail: t("petDetail", {
        breed: t("domesticShorthair"),
        lastVisit: t("lastVisitDate", { date: lastVisitDate }),
      }),
      status: t("dueSoon"),
      badgeClass: "bg-warning text-warning-foreground",
    },
  ];

  return {
    copy: {
      recentPets: t("recentPets"),
      description: t("description"),
      registered: t("registered", { count: pets.length }),
      searchLabel: t("searchLabel"),
      searchPlaceholder: t("searchPlaceholder"),
      petList: t("petList"),
      vaccineReminder: t("vaccineReminder"),
      reminder: t("reminder", { date: dueDate }),
    },
    pets,
  };
};
