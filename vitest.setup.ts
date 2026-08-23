import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, vi } from "vitest";

// Provide dummy env for Neon client so import does not throw in tests
process.env.DATABASE_URL ||= "postgresql://user:password@127.0.0.1:5432/pawpass?sslmode=disable";
process.env.DATABASE_URL_UNPOOLED ||= process.env.DATABASE_URL;
process.env.BROKEN_DATABASE_URL ||= "postgresql://user:invalid@127.0.0.1:5432/pawpass?sslmode=disable";
process.env.DEMO_LAB_ENABLED ||= "true";
process.env.DEMO_CONTROL_TOKEN ||= "test-token";

afterEach(() => {
  cleanup();
});

Object.defineProperties(HTMLElement.prototype, {
  hasPointerCapture: { configurable: true, value: vi.fn(() => false) },
  releasePointerCapture: { configurable: true, value: vi.fn() },
  scrollIntoView: { configurable: true, value: vi.fn() },
  setPointerCapture: { configurable: true, value: vi.fn() },
});

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
  Nunito_Sans: () => ({ variable: "--font-nunito-sans" }),
  Varela_Round: () => ({ variable: "--font-varela-round" }),
}));

vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: Record<string, any>) => createElement("img", props),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  redirect: vi.fn(),
  usePathname: () => "/en",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    locale,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    locale: string;
  }) =>
    createElement(
      "a",
      { href: `/${locale}${href === "/" ? "" : href}`, ...props },
      children,
    ),
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
