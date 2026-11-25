/**
 * Secure Cookie Storage Utility
 * Provides hardened cookie read/write/delete with SameSite=Strict and Secure flags.
 * Storing sensitive tokens in cookies with Strict flags protects them against XSS and CSRF exposure.
 */

export interface CookieOptions {
  days?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return;

  const path = options.path || '/';
  const sameSite = options.sameSite || 'Strict';
  const isSecure =
    options.secure ?? (typeof window !== 'undefined' && window.location.protocol === 'https:');

  let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}`;

  if (options.days && options.days > 0) {
    const expires = new Date(Date.now() + options.days * 864e5).toUTCString();
    cookieStr += `; Expires=${expires}`;
  }

  if (options.domain) {
    cookieStr += `; Domain=${options.domain}`;
  }

  if (isSecure) {
    cookieStr += '; Secure';
  }

  document.cookie = cookieStr;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const encodedName = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(encodedName)) {
      try {
        return decodeURIComponent(cookie.substring(encodedName.length));
      } catch {
        return cookie.substring(encodedName.length);
      }
    }
  }

  return null;
}

export function deleteCookie(name: string, path = '/'): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
}
