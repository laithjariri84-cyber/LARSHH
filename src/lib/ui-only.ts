export function isUiOnlyMode(): boolean {
  return process.env.NEXT_PUBLIC_UI_ONLY === "true";
}
