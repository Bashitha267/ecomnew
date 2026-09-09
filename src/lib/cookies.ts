/**
 * Carlton Valley — Browser Cookie Utilities
 * Used for persisting regional preferences (e.g. country, currency).
 */

export const COUNTRY_COOKIE_NAME = "cv_selected_country";
export const COUNTRY_CHOSEN_COOKIE_NAME = "cv_country_selected";

/**
 * Set a cookie in the browser
 * @param name Cookie name
 * @param value Cookie value
 * @param days Expiration in days (default: 365)
 */
export function setCookie(name: string, value: string, days: number = 365): void {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = date.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};max-age=${maxAge};expires=${expires};path=/;SameSite=Lax`;
}

/**
 * Get a cookie value by name in the browser
 * @param name Cookie name
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}

/**
 * Delete a cookie by name
 * @param name Cookie name
 */
export function removeCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;max-age=0;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
}
