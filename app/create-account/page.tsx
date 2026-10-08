"use client";

import Link from "next/link";
import { useState } from "react";
import { signUp } from "@/app/actions/auth";
import { AtIcon, SmsIcon, UserIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/navigation";
import { AuthPanel } from "@/components/auth/auth-panel";
import { GoogleLogo } from "@/components/auth/google-logo";
import { CtaButton } from "@/components/landing/cta-button";
import { Footer } from "@/components/landing/footer";
import { HeaderNav } from "@/components/landing/header-nav";
import { InputField } from "@/components/ui/input-field";

export default function CreateAccountPage() {
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
            className="flex w-full max-w-[460px] flex-col desk:mt-[63px] desk:ml-[100px] desk:w-[460px]"
            onSubmit={async (event) => {
              event.preventDefault();
              setPending(true);
              setError(null);
              setNotice(null);
              const formData = new FormData(event.currentTarget);
              formData.set("next", safeNextPath(new URLSearchParams(window.location.search).get("next")));
              const result = await signUp(formData);
              setPending(false);
              if (result?.error) setError(result.error);
              if (result?.message) setNotice(result.message);
            }}
          >
            <h1 className="m-0 font-medium text-[32px] leading-[100%] text-[#14181b] desk:text-[40px]">
              Create Account
            </h1>
            <p className="mt-[8px] font-medium text-[16px] leading-[20px] text-[#637A87]">
              Kindly enter the correct details to get started
            </p>
            <div className="mt-5 flex flex-col gap-6 desk:mt-[20px] desk:gap-[24px]">
              <InputField
                label="Full Name"
                name="name"
                placeholder="Enter your full name"
                icon={<UserIcon size={20} />}
              />
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
                placeholder="Enter a strong password"
                minLength={8}
                icon={<AtIcon size={20} />}
              />
              <label className="flex items-start gap-[8px] font-medium text-[16px] leading-[20px] text-[#4F616C] sm:items-center">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 size-[18px] shrink-0 rounded-[4px] border border-solid border-[#e4e8eb] sm:mt-0"
                />
                <span>
                  I agree to{" "}
                  <Link href="/terms" className="text-[#296cf0]">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-[#296cf0]">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {error ? (
                <p className="font-medium text-[14px] leading-[18px] text-[#b42318]">{error}</p>
              ) : null}
              {notice ? (
                <p className="font-medium text-[14px] leading-[18px] text-[#048bdc]">{notice}</p>
              ) : null}
              <CtaButton type="submit" disabled={pending} className="h-[60px] w-full">
                Create an account
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
                Sign up using Google
              </button>
              <p className="text-center font-medium text-[16px] leading-[20px] text-[#4F616C]">
                Not new here?{" "}
                <Link href="/sign-in" className="font-bold text-[#296cf0]">
                  Sign into your account
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
