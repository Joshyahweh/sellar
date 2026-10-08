"use server";

import { redirect } from "next/navigation";
import { isPasswordLongEnough, passwordLengthMessage } from "@/lib/password";
import { allowRequest, rateLimited } from "@/lib/rate-limit";
import { safeNextPath } from "@/lib/navigation";
import { getSiteOrigin } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

const OTP_LENGTH = 8;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function signIn(formData: FormData): Promise<{ error?: string } | void> {
  if (!(await allowRequest("sign-in", 10, FIFTEEN_MINUTES))) return rateLimited;

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? "/home"));

  if (!isEmail(email) || password.length < 1) {
    return { error: "Enter the email and password for your account." };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Supabase is not configured." };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect(next);
}

export async function signUp(formData: FormData): Promise<{ error?: string; message?: string } | void> {
  if (!(await allowRequest("sign-up", 5, FIFTEEN_MINUTES))) return rateLimited;

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? "/home"));

  if (name.length < 2) return { error: "Enter your full name." };
  if (!isEmail(email)) return { error: "Enter a valid email address." };
  if (!isPasswordLongEnough(password)) return { error: passwordLengthMessage };

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Supabase is not configured." };
  }
  const site = await getSiteOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${site}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) return { error: error.message };
  if (!data.session) {
    return { message: "Check your email to confirm your account, then sign in." };
  }

  redirect(next);
}

export async function sendPasswordOtp(): Promise<{ error?: string; message?: string }> {
  if (!(await allowRequest("password-otp", 3, FIFTEEN_MINUTES))) return rateLimited;

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Supabase is not configured." };
  }

  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in?next=/change-password");

  const { error } = await supabase.auth.reauthenticate();
  if (error) return { error: error.message };
  return { message: "We sent an 8 digit code to your email." };
}

export async function changePassword(formData: FormData): Promise<{ error?: string; message?: string }> {
  if (!(await allowRequest("change-password", 8, FIFTEEN_MINUTES))) return rateLimited;

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const nonce = String(formData.get("nonce") ?? "").replace(/\D/g, "");

  if (!isPasswordLongEnough(password)) return { error: passwordLengthMessage };
  if (password !== confirm) return { error: "Passwords do not match." };
  if (nonce.length !== OTP_LENGTH) {
    return { error: `Enter the ${OTP_LENGTH} digit code from your email.` };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Supabase is not configured." };
  }

  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in?next=/change-password");

  const { error } = await supabase.auth.updateUser({ password, nonce });
  if (error) return { error: error.message };
  return { message: "Your password has been updated." };
}

export async function requestPasswordReset(email: string): Promise<{ error?: string; message?: string }> {
  if (!(await allowRequest("password-reset", 5, FIFTEEN_MINUTES))) return rateLimited;

  const trimmed = email.trim();
  if (!isEmail(trimmed)) return { error: "Enter the email address on your account." };

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Supabase is not configured." };
  }
  const site = await getSiteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
    redirectTo: `${site}/auth/callback?next=/home`,
  });

  if (error) return { error: error.message };
  return { message: "If that email has an account, a reset link is on its way." };
}
