import { describe, expect, it } from "vitest";

import {
  buildErrorResponse,
  buildSuccessResponse,
  isApiErrorCode,
} from "./apiErrors";

describe("API error contracts", () => {
  it("recognizes supported API error codes", () => {
    expect(isApiErrorCode("VALIDATION_FAILED")).toBe(true);
    expect(isApiErrorCode("SOMETHING_ELSE")).toBe(false);
  });

  it("builds an error response with optional field codes", () => {
    expect(
      buildErrorResponse("VALIDATION_FAILED", "support-1", {
        name: "NAME_REQUIRED",
      }),
    ).toEqual({
      ok: false,
      errorCode: "VALIDATION_FAILED",
      fieldErrorCodes: { name: "NAME_REQUIRED" },
      supportId: "support-1",
    });
    expect(buildErrorResponse("PETS_LOAD_FAILED", "support-2")).toEqual({
      ok: false,
      errorCode: "PETS_LOAD_FAILED",
      supportId: "support-2",
    });
  });

  it("builds a success response", () => {
    expect(buildSuccessResponse({ pets: [] }, "request-1")).toEqual({
      ok: true,
      pets: [],
      requestId: "request-1",
    });
  });
});
