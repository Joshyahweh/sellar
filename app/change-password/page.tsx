"use client";

import Link from "next/link";
import { useState } from "react";
import { changePassword, sendPasswordOtp } from "@/app/actions/auth";
import { ArrowLeftIcon } from "@/components/icons";
import { CtaButton } from "@/components/landing/cta-button";
import { HeaderNav } from "@/components/landing/header-nav";
import { InputField } from "@/components/ui/input-field";

export default function ChangePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[1440px] bg-[#fdfdfd] pb-16">
      <HeaderNav variant="signedIn" />
      <div className="mx-auto w-full max-w-[460px] px-4 pt-6 desk:pt-[140px]">
        <div className="flex items-center gap-[8px]">
          <Link href="/home" aria-label="Back">
            <ArrowLeftIcon size={22} color="#14181b" />
          </Link>
          <h1 className="m-0 font-semibold text-[24px] leading-[29px] text-[#14181b]">
            Change password
          </h1>
        </div>
        <p className="mt-3 font-normal text-[14px] leading-[20px] text-[#626262]">
          We will send an 8 digit code to your email before you can set a new password.
        </p>
        <form
          className="mt-8 flex flex-col gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setPending(true);
            setError(null);
            setNotice(null);
            const result = await changePassword(new FormData(event.currentTarget));
            setPending(false);
            if (result?.error) setError(result.error);
            if (result?.message) {
              setNotice(result.message);
              setCodeSent(false);
              event.currentTarget.reset();
            }
          }}
        >
          <InputField
            label="Email code"
            name="nonce"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            placeholder="8 digit code"
            required
          />
          <InputField
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Enter a new password"
            required
          />
          <InputField
            label="Confirm password"
            name="confirm"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Re-enter the new password"
            required
          />
          {error ? <p className="m-0 text-[14px] text-[#FF0C6D]">{error}</p> : null}
          {notice ? <p className="m-0 text-[14px] text-[#048bdc]">{notice}</p> : null}
          <CtaButton
            type="button"
            disabled={pending}
            className="h-[56px] w-full"
            onClick={async () => {
              setPending(true);
              setError(null);
              setNotice(null);
              const result = await sendPasswordOtp();
              setPending(false);
              if (result?.error) {
                setError(result.error);
                return;
              }
              setCodeSent(true);
              setNotice(result?.message ?? "We sent an 8 digit code to your email.");
            }}
          >
            Send code
          </CtaButton>
          <CtaButton type="submit" disabled={pending || !codeSent} className="h-[56px] w-full">
            Update password
          </CtaButton>
        </form>
      </div>
    </div>
  );
}
