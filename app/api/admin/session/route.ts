import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  adminCookieOptions,
  createAdminSessionToken,
  getAdminConfiguration,
  verifyAdminPasscode,
  verifyAdminSessionToken,
} from "../../../../lib/admin-auth";

export async function GET(request: NextRequest) {
  const configuration = getAdminConfiguration();
  const authenticated = verifyAdminSessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );
  return NextResponse.json({ authenticated, configured: configuration.configured });
}

export async function POST(request: NextRequest) {
  const configuration = getAdminConfiguration();
  if (!configuration.configured) {
    return NextResponse.json(
      { error: `Admin is not configured. Missing: ${configuration.missing.join(", ")}.` },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as { passcode?: unknown } | null;
  const passcode = typeof body?.passcode === "string" ? body.passcode : "";
  if (!verifyAdminPasscode(passcode)) {
    return NextResponse.json({ error: "Passcode is not correct." }, { status: 401 });
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), adminCookieOptions);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...adminCookieOptions,
    maxAge: 0,
  });
  return response;
}
