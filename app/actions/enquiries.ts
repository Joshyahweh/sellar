"use server";

import { allowRequest, rateLimited } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function submitEnquiry(formData: FormData): Promise<{ error?: string; message?: string }> {
  if (!(await allowRequest("enquiry", 3, 15 * 60 * 1000))) return rateLimited;

  const fullName = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (fullName.length < 2 || fullName.length > 120) return { error: "Enter your full name." };
  if (!isEmail(email) || email.length > 180) return { error: "Enter a valid email address." };
  if (subject.length < 2 || subject.length > 180) return { error: "Enter a subject." };
  if (message.length < 8 || message.length > 4000) return { error: "Enter a message we can reply to." };

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("enquiries").insert({
      full_name: fullName,
      email,
      subject,
      message,
    });
    if (error) return { error: "We could not send your enquiry. Try again in a moment." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "We could not send your enquiry." };
  }

  return { message: "Your enquiry has been sent. We will get back to you soon." };
}
