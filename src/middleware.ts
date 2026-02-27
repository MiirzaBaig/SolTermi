import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // #region agent log
  fetch("http://127.0.0.1:7259/ingest/c132c345-0d90-492d-8f59-aacafebf4960", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "middleware.ts",
      message: "request received",
      data: { path: request.nextUrl.pathname, method: request.method },
      timestamp: Date.now(),
      hypothesisId: "H1,H2,H4",
    }),
  }).catch(() => {});
  // #endregion
  return NextResponse.next();
}
