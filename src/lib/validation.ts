import { z } from "zod";

// Age: optional, integer 0-100, accepts number or numeric string, empty → undefined
const ageSchema = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    const num = typeof val === "string" ? Number(val) : val;
    return num;
  })
  .pipe(
    z
      .number({ message: "La edad debe ser un número." })
      .int("La edad debe ser un número entero.")
      .min(0, "La edad debe estar entre 0 y 100.")
      .max(100, "La edad debe estar entre 0 y 100.")
      .optional(),
  );

export const createPetSchema = z.object({
  name: z
    .string({ message: "El nombre es obligatorio." })
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(100, "El nombre no puede superar 100 caracteres."),
  petTypeId: z
    .string({ message: "Selecciona un tipo válido." })
    .uuid("Selecciona un tipo válido."),
  age: ageSchema.optional(),
  ownerName: z
    .string({ message: "El nombre del propietario es obligatorio." })
    .trim()
    .min(1, "El nombre del propietario es obligatorio.")
    .max(100, "El nombre del propietario no puede superar 100 caracteres."),
});

export type CreatePetInput = z.infer<typeof createPetSchema>;
export type FieldErrors = Partial<Record<keyof CreatePetInput | "sessionId", string>>;

const FORBIDDEN_KEYS = ["sessionId", "session_id"] as const;

/**
 * Validates raw JSON body for POST /api/pets.
 * - Strictly rejects if body contains sessionId/session_id (FR-018, A3) → 400
 * - Otherwise applies createPetSchema (other unknown keys are stripped/ignored)
 */
export function validatePetInput(body: unknown):
  | { success: true; data: CreatePetInput }
  | { success: false; fieldErrors: FieldErrors; message: string } {
  if (body !== null && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    for (const key of FORBIDDEN_KEYS) {
      if (key in obj) {
        return {
          success: false,
          fieldErrors: { sessionId: "No permitido." },
          message: "Revisa los datos ingresados.",
        };
      }
    }
  }

  const parsed = createPetSchema.safeParse(body);
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  const fieldErrors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const path = issue.path[0] as keyof CreatePetInput | undefined;
    if (path && !fieldErrors[path]) {
      fieldErrors[path] = issue.message;
    }
  }

  // Fallback for root-level errors (e.g., body not an object)
  if (Object.keys(fieldErrors).length === 0) {
    fieldErrors.name = parsed.error.issues[0]?.message ?? "Datos inválidos.";
  }

  return {
    success: false,
    fieldErrors,
    message: "Revisa los datos ingresados.",
  };
}
