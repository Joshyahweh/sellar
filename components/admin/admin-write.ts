import { apiJson } from "@/lib/api/browser";

export async function adminUpload(url: string, body: FormData) {
  return apiJson(url, { method: "POST", body });
}

export async function adminWrite(url: string, method: "POST" | "PATCH" | "DELETE", body?: Record<string, unknown>) {
  return apiJson(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

export const fieldClass =
  "h-10 w-full rounded-lg border border-[#e4e8eb] bg-white px-3 text-[14px] text-[#14181b] outline-none";

export const labelClass = "flex flex-col gap-1 text-[13px] font-medium text-[#373535]";
