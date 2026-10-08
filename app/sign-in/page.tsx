"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset, signIn } from "@/app/actions/auth";
import { AtIcon, SmsIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/navigation";
import { AuthPanel } from "@/components/auth/auth-panel";
import { GoogleLogo } from "@/components/auth/google-logo";
import { CtaButton } from "@/components/landing/cta-button";
import { Footer } from "@/components/landing/footer";
import { HeaderNav } from "@/components/landing/header-nav";
import { InputField } from "@/components/ui/input-field";

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-[1440px] bg-[#fdfdfd]">
      <section className="relative w-full overflow-x-clip desk:h-[1178px] desk:overflow-clip">
        <HeaderNav variant="auth" className="desk:top-[63px]" />
        <div className="flex w-full flex-col items-center px-5 pt-8 pb-12 desk:absolute desk:top-[165px] desk:left-[110px] desk:h-[848px] desk:w-[1221px] desk:flex-row desk:items-start desk:px-0 desk:pt-0 desk:pb-0">
          <AuthPanel />
          <form
            name="sign-in"
            className="flex w-full max-w-[460px] flex-col desk:mt-[107px] desk:ml-[100px] desk:w-[460px]"
            onSubmit={async (event) => {
              event.preventDefault();
              setPending(true);
              setError(null);
              setNotice(null);
              const formData = new FormData(event.currentTarget);
              formData.set("next", safeNextPath(new URLSearchParams(window.location.search).get("next")));
              const result = await signIn(formData);
              setPending(false);
              if (result?.error) setError(result.error);
            }}
          >
            <h1 className="m-0 font-medium text-[32px] leading-[100%] text-[#14181b] desk:text-[40px]">
              Welcome Back!!!!
            </h1>
            <p className="mt-[8px] font-medium text-[16px] leading-[20px] text-[#637A87]">
              Kindly enter the correct details to sign into your account
            </p>
            <div className="mt-8 flex flex-col gap-6 desk:mt-[40px] desk:gap-[24px]">
              <InputField
                label="Email Address"
                name="email"
                type="email"
                placeholder="Enter your email address"
                icon={<SmsIcon size={20} />}
              />
              <InputField
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                icon={<AtIcon size={20} />}
              />
              <div className="flex min-h-[32px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-[8px] font-medium text-[16px] leading-[20px] text-[#4F616C]">
                  <input
                    type="checkbox"
                    className="size-[18px] rounded-[4px] border border-solid border-[#e4e8eb]"
                  />
                  Remember me for 30 days
                </label>
                <button
                  type="button"
                  className="border-0 bg-transparent p-0 text-left font-bold text-[16px] leading-[20px] text-[#048BDC]"
                  onClick={async () => {
                    const input = document.getElementById("email-address");
                    const email = input instanceof HTMLInputElement ? input.value : "";
                    const result = await requestPasswordReset(email);
                    setError(result.error ?? null);
                    setNotice(result.message ?? null);
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              {error ? (
                <p className="font-medium text-[14px] leading-[18px] text-[#b42318]">{error}</p>
              ) : null}
              {notice ? (
                <p className="font-medium text-[14px] leading-[18px] text-[#048bdc]">{notice}</p>
              ) : null}
              <CtaButton type="submit" disabled={pending} className="h-[60px] w-full">
                Sign in
              </CtaButton>
              <div className="relative flex h-[28px] items-center justify-center">
                <span className="absolute inset-x-0 top-1/2 h-px bg-[#e4e8eb]" />
                <span className="relative bg-[#fdfdfd] px-[8px] text-[16px] text-[#626262]">
                  Or
                </span>
              </div>
              <button
                type="button"
                className="flex h-[58px] w-full cursor-pointer items-center justify-center gap-[8px] rounded-[8px] border border-solid border-[#e4e8eb] bg-white font-semibold text-[16px] text-[#14181b]"
                onClick={async () => {
                  const supabase = createClient();
                  if (!supabase) {
                    setError("Supabase is not configured yet.");
                    return;
                  }
                  const next = safeNextPath(new URLSearchParams(window.location.search).get("next"));
                  const { error: authError } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
                    },
                  });
                  if (authError) setError(authError.message);
                }}
              >
                <GoogleLogo />
                Sign in using Google
              </button>
              <p className="text-center font-medium text-[16px] leading-[20px] text-[#4F616C]">
                New here?{" "}
                <Link
                  href="/create-account"
                  className="font-bold text-[#296cf0]"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}
