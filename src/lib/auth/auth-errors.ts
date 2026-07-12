import { AuthSessionMissingError } from "@supabase/supabase-js";

const BENIGN_AUTH_MESSAGES = new Set([
  "Auth session missing!",
  "Auth session or user missing",
]);

function messageFromError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "";
}

/**
 * Expected when no user is signed in, or when auth is evaluated outside a
 * request context (e.g. static build). These should not be logged as errors.
 */
export function isBenignAuthAbsence(error: unknown): boolean {
  if (!error) {
    return false;
  }

  if (error instanceof AuthSessionMissingError) {
    return true;
  }

  if (typeof error === "object" && error !== null && "name" in error) {
    const name = (error as { name: string }).name;
    if (
      name === "AuthSessionMissingError" ||
      name === "AuthInvalidTokenResponseError"
    ) {
      return true;
    }
  }

  const message = messageFromError(error);
  if (BENIGN_AUTH_MESSAGES.has(message)) {
    return true;
  }

  if (message.includes("Dynamic server usage")) {
    return true;
  }

  return false;
}

export function isBenignAuthError(error: unknown): boolean {
  return isBenignAuthAbsence(error);
}
