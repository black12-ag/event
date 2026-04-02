import crypto from "crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "event_admin_session";
const ADMIN_PIN = process.env.ADMIN_PIN;
const ADMIN_SECRET =
  process.env.ADMIN_SESSION_SECRET || "coffee-house-session";

const getSessionToken = () =>
  crypto
    .createHash("sha256")
    .update(`${ADMIN_PIN || ""}:${ADMIN_SECRET}`)
    .digest("hex");

export const verifyAdminPin = (pin: string) =>
  Boolean(ADMIN_PIN) && pin === ADMIN_PIN;

export const isAdminAuthenticated = () =>
  cookies().get(ADMIN_COOKIE_NAME)?.value === getSessionToken();

export const setAdminSession = () => {
  cookies().set({
    name: ADMIN_COOKIE_NAME,
    value: getSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
};

export const clearAdminSession = () => {
  cookies().set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
};
