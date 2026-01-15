import type { SerializeOptions } from "cookie";
import { parse, serialize } from "cookie";

export function parseCookies(cookieString: string) {
  return parse(cookieString);
}

export function setClientCookie(name: string, value: string, options: SerializeOptions = {}) {
  document.cookie = serialize(name, value, options);
}
