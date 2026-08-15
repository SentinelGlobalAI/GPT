import "server-only";

import { timingSafeEqual } from "node:crypto";

export function isAuthorized(authorization: string | null) {
  const expected = process.env.SENTINEL_ADS_INGEST_KEY;
  if (!expected || !authorization?.startsWith("Bearer ")) return false;

  const suppliedBytes = Buffer.from(authorization.slice(7));
  const expectedBytes = Buffer.from(expected);
  if (suppliedBytes.length !== expectedBytes.length) return false;

  return timingSafeEqual(suppliedBytes, expectedBytes);
}
