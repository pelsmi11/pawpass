import { describe, expect, it, vi } from "vitest";

import RootLayout, { generateMetadata, generateStaticParams } from "./layout";

vi.mock("next-intl/server", () => ({
  getMessages: vi.fn(async () => ({})),
  getTranslations: vi.fn(
    async ({ locale }: { locale: string; namespace: string }) =>
      (key: "title" | "description") =>
        ({
          en: {
            title: "PawPass · Pet health registry",
            description:
              "A friendly, trustworthy registry for your companions — records, reminders and check-ins in one warm place.",
          },
          es: {
            title: "PawPass · Registro de salud para mascotas",
            description:
              "Un registro amigable y confiable para tus mascotas: expedientes, recordatorios y revisiones en un solo lugar.",
          },
        })[locale]?.[key],
  ),
}));

describe("localized root layout", () => {
  it("pre-renders every supported locale", () => {
    expect(generateStaticParams()).toEqual([{ locale: "en" }, { locale: "es" }]);
  });

  it.each([
    [
      "en",
      "PawPass · Pet health registry",
      "A friendly, trustworthy registry for your companions — records, reminders and check-ins in one warm place.",
    ],
    [
      "es",
      "PawPass · Registro de salud para mascotas",
      "Un registro amigable y confiable para tus mascotas: expedientes, recordatorios y revisiones en un solo lugar.",
    ],
  ])("generates %s metadata", async (locale, title, description) => {
    await expect(
      generateMetadata({ children: null, params: Promise.resolve({ locale }) }),
    ).resolves.toEqual({ title, description });
  });

  it("returns no metadata for an unsupported locale", async () => {
    await expect(
      generateMetadata({ children: null, params: Promise.resolve({ locale: "fr" }) }),
    ).resolves.toEqual({});
  });

  it.each(["en", "es"])("sets html lang to %s", async (locale) => {
    const tree = await RootLayout({
      children: <main />,
      params: Promise.resolve({ locale }),
    });

    expect(tree.props.lang).toBe(locale);
  });
});
