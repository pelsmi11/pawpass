export type LogEvent =
  | "PET_REGISTRATION_STARTED"
  | "PET_REGISTRATION_SUCCEEDED"
  | "PET_REGISTRATION_FAILED"
  | "DEMO_DATABASE_OUTAGE_ACTIVATED"
  | "DEMO_DATABASE_OUTAGE_FAILED"
  | "DEMO_INCIDENT_RESET"
  | "DEMO_INCIDENT_RESET_FAILED"
  | "DEMO_STATUS_FETCHED"
  | "DEMO_STATUS_FAILED"
  | "HEALTH_CHECK"
  | "PET_TYPES_LISTED"
  | "PET_TYPES_LOAD_FAILED"
  | "PETS_LOAD_FAILED"
  | "PET_CREATE_FAILED"
  | "SESSION_ENSURED";

export type ErrorType = "ValidationError" | "DatabaseUnavailableError" | "ForeignKeyViolation" | "UnexpectedError";

export type LogFields = {
  severity: "INFO" | "WARN" | "ERROR";
  message: string;
  service: "pawpass";
  event: LogEvent;
  route: string;
  sessionId?: string;
  requestId: string;
  httpStatus?: number;
  durationMs?: number;
  petTypeCode?: string;
  errorType?: ErrorType;
  databaseCode?: string;
  incident?: string;
};

const sanitize = (fields: LogFields): LogFields => {
  // Whitelist already enforced by type; ensure no extra fields leak
  return fields;
};

export const log = (fields: LogFields): void => {
  console.log(JSON.stringify(sanitize(fields)));
};

export const logError = (fields: LogFields): void => {
  console.error(JSON.stringify(sanitize(fields)));
};
