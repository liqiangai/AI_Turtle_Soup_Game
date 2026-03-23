import crypto from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Request, Response } from "express";
import { app } from "../src/server";

function normalizeFunctionUrl(req: IncomingMessage, canonicalPath: string): void {
  const rawUrl = typeof req.url === "string" ? req.url : "";
  const [pathPart, queryPart] = rawUrl.split("?", 2);
  const pathOnly = pathPart ?? "";
  const querySuffix = queryPart ? `?${queryPart}` : "";

  if (pathOnly === "" || pathOnly === "/" || pathOnly === canonicalPath) {
    req.url = `${canonicalPath}${querySuffix}`;
    return;
  }

  const withoutApiPrefix = canonicalPath.replace(/^\/api/, "");
  if (pathOnly === withoutApiPrefix) {
    req.url = `${canonicalPath}${querySuffix}`;
  }
}

function getIncomingRequestId(req: IncomingMessage): string {
  const header = req.headers["x-request-id"];
  if (typeof header === "string" && header.trim().length > 0) return header.trim().slice(0, 128);
  return crypto.randomUUID();
}

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  normalizeFunctionUrl(req, "/api/test");
  try {
    (app as unknown as (req: Request, res: Response) => void)(
      req as unknown as Request,
      res as unknown as Response
    );
  } catch (err) {
    const requestId = getIncomingRequestId(req);
    if (!res.headersSent) {
      res.setHeader("x-request-id", requestId);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    res.end(JSON.stringify({ ok: false, message: "Internal Server Error", requestId }));
    console.error("[api] vercel_handler_error", { requestId, message });
  }
}
