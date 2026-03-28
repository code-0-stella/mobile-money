import { Request, Response, NextFunction } from "express";
import { geolocationService, LocationMetadata, UNKNOWN_LOCATION } from "../services/geolocation";

/**
 * Extract the true client IP from the request.
 *
 * Priority:
 *  1. X-Forwarded-For header (leftmost non-private IP — the original client)
 *  2. X-Real-IP header (set by some reverse proxies)
 *  3. req.ip (Express's own resolution, which respects `trust proxy`)
 *  4. socket.remoteAddress
 */
export function extractClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    // XFF may be "client, proxy1, proxy2" — take the leftmost (original client)
    const first = raw.split(",")[0].trim();
    if (first) return first;
  }

  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0].trim() : realIp.trim();
  }

  return req.ip || req.socket?.remoteAddress || "";
}

// Augment Express Request so downstream handlers can read geo data
declare module "express-serve-static-core" {
  interface Request {
    geoLocation?: LocationMetadata;
    clientIp?: string;
  }
}

/**
 * Express middleware that resolves the client IP and attaches geo metadata
 * to `req.geoLocation` and `req.clientIp`.
 *
 * Non-blocking: failures are swallowed and result in UNKNOWN_LOCATION.
 */
export async function geolocateMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const ip = extractClientIp(req);
  req.clientIp = ip;

  try {
    req.geoLocation = await geolocationService.lookup(ip);
  } catch {
    req.geoLocation = { ...UNKNOWN_LOCATION };
  }

  next();
}
