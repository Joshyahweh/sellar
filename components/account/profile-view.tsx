"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { PlaceOrderModal } from "@/components/checkout/place-order-modal";
import { CallCallingIcon, CrossIcon, EditIcon, SmsIcon, UnlockIcon, UserIcon } from "@/components/icons";
import { CtaButton } from "@/components/landing/cta-button";
import { HeaderNav } from "@/components/landing/header-nav";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { DeliveryAddress } from "@/lib/orders";
import { MIN_PASSWORD_LENGTH, passwordLengthMessage } from "@/lib/password";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type ProfileTab = "about" | "security";
type PasswordStep = "send" | "otp" | "password" | null;

const OTP_LENGTH = 8;
const OTP_RESEND_WAIT = 30;
const emptyOtp = () => Array.from({ length: OTP_LENGTH }, () => "");

export function ProfileView({
  name,
  email,
  phone,
  address,
  format = "hard-copy",
  orderId = null,
}: {
  name: string;
  email: string;
  phone: string;
  address: DeliveryAddress | null;
  format?: string;
  orderId?: string | null;
}) {
  const [tab, setTab] = useState<ProfileTab>("about");
  const [addressOpen, setAddressOpen] = useState(false);
  const [step, setStep] = useState<PasswordStep>(null);
  const [code, setCode] = useState(emptyOtp);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const waitingToResend = resendIn > 0;

  useEffect(() => {
    if (!waitingToResend) return;
    const timer = window.setInterval(() => {
      setResendIn((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [waitingToResend]);

  function closeDialog() {
    if (pending) return;
    setStep(null);
    setError(null);
    setOtpNotice(null);
    setResendIn(0);
    setCode(emptyOtp());
    setPassword("");
    setConfirm("");
    setShowPassword(false);
    setShowConfirm(false);
  }

  async function sendOtp(fromResend = false) {
    if (fromResend && resendIn > 0) return;
    setPending(true);
    setError(null);
    const supabase = createClient();
    if (!supabase) {
      setPending(false);
      setError("Sign-in is not available right now.");
      return;
    }
    const { error: otpError } = await supabase.auth.reauthenticate();
    setPending(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setStep("otp");
    setResendIn(OTP_RESEND_WAIT);
    if (fromResend) setOtpNotice("A new code has been sent.");
  }

  function fillOtp(raw: string, start = 0) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;
    const from = digits.length >= OTP_LENGTH ? 0 : start;
    const slice = digits.slice(0, OTP_LENGTH - from);
    setCode((current) => {
      const next = [...current];
      if (digits.length >= OTP_LENGTH) return digits.slice(0, OTP_LENGTH).split("");
      for (let i = 0; i < slice.length; i += 1) next[from + i] = slice[i];
      return next;
    });
    const focusAt = digits.length >= OTP_LENGTH ? OTP_LENGTH - 1 : Math.min(from + slice.length, OTP_LENGTH - 1);
    requestAnimationFrame(() => otpRefs.current[focusAt]?.focus());
  }

  async function savePassword() {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(passwordLengthMessage);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    const nonce = code.join("");
    if (nonce.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH} digit code from your email.`);
      setStep("otp");
      return;
    }
    setPending(true);
    setError(null);
    const supabase = createClient();
    if (!supabase) {
      setPending(false);
      setError("Sign-in is not available right now.");
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password, nonce });
    setPending(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setNotice("Your password has been updated.");
    closeDialog();
  }

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[1440px] bg-[#fdfdfd] pb-16">
      <HeaderNav variant="signedIn" />
      <div className="mx-auto w-full max-w-[1031px] px-4 pt-6 desk:px-0 desk:pt-[120px]">
        <h1 className="m-0 font-medium text-[20px] leading-[24px] text-[#14181b]">Profile</h1>
        <div className="relative mt-[20px]">
          <img
            src="/images/profile-cover.png"
            alt=""
            className="block h-[112px] w-full rounded-[8px] object-cover object-left desk:h-auto"
          />
          <div className="absolute bottom-[-28px] left-0 flex size-[72px] items-center justify-center rounded-full bg-[#296cf0] font-semibold text-[22px] leading-none text-white ring-[4px] ring-white">
            {initials(name)}
          </div>
        </div>
        <div className="mt-[44px] flex items-end gap-[28px] border-b border-solid border-[#f2f3f8]">
          <TabButton active={tab === "about"} onClick={() => setTab("about")}>
            About me
          </TabButton>
          <TabButton active={tab === "security"} onClick={() => setTab("security")}>
            Security
          </TabButton>
        </div>

        {tab === "about" ? (
          <div className="mt-[24px] flex flex-col gap-[20px]">
            <ReadOnlyField label="Full name" value={name} icon={<UserIcon size={18} color="#a5a5a5" />} />
            <ReadOnlyField label="Email address" value={email} icon={<SmsIcon size={18} color="#a5a5a5" />} />
            <ReadOnlyField label="Phone number" value={phone || "—"} icon={<CallCallingIcon size={18} color="#a5a5a5" />} />
            <div>
              <div className="mb-[12px] flex items-center justify-between gap-3">
                <p className="m-0 font-medium text-[14px] leading-[17px] text-[#14181b]">Delivery Address</p>
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-[4px] border-0 bg-transparent p-0 font-medium text-[13px] leading-[16px] text-[#296cf0]"
                  onClick={() => setAddressOpen(true)}
                >
                  <EditIcon size={16} color="#296cf0" />
                  Change delivery address
                </button>
              </div>
              <div className="flex flex-col gap-[10px] rounded-[8px] bg-[#f8f8f8] px-[16px] py-[14px]">
                <AddressRow label="State" value={address?.state || "—"} />
                <AddressRow label="City/Town" value={address?.town || "—"} />
                <AddressRow label="Phone number" value={address?.phone || phone || "—"} />
                <AddressRow label="Nearest landmark" value={address?.landmark || "—"} />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-[24px]">
            <div className="flex flex-col gap-4 rounded-[8px] border border-solid border-[#f2f3f8] bg-white px-[16px] py-[16px] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="m-0 font-medium text-[14px] leading-[17px] text-[#14181b]">Update your password</p>
                <p className="mt-[4px] font-normal text-[13px] leading-[16px] text-[#a5a5a5]">
                  Change your password to a new one
                </p>
              </div>
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent p-0 text-left font-medium text-[14px] leading-[17px] text-[#296cf0]"
                onClick={() => { setError(null); setStep("send"); }}
              >
                Change password
              </button>
            </div>
            {notice ? <p className="mt-[16px] font-medium text-[13px] leading-[16px] text-[#048bdc]">{notice}</p> : null}
          </div>
        )}
      </div>

      {addressOpen ? (
        <PlaceOrderModal
          format={format}
          previous={address}
          startEditing
          orderId={orderId}
          stayOnPage
          onDismiss={() => setAddressOpen(false)}
        />
      ) : null}

      <Dialog open={step !== null} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent
          showCloseButton={false}
          overlayClassName="z-[80] bg-[#e4e7f5]/55 supports-backdrop-filter:backdrop-blur-md!"
          className="z-[80] gap-0 rounded-[16px] bg-white p-[24px] text-[#14181b] shadow-[0_8px_32px_rgba(20,24,27,0.08)] ring-0 sm:max-w-[400px]"
        >
          <div className="mb-[16px] flex items-center justify-between">
            <DialogTitle className="m-0 font-medium text-[16px] leading-[20px] text-[#14181b]">
              {step === "send" ? "Send OTP" : step === "otp" ? "OTP" : "Change password"}
            </DialogTitle>
            <DialogClose aria-label="Close" className="flex size-5 cursor-pointer items-center justify-center border-0 bg-transparent p-0">
              <CrossIcon size={18} color="#14181b" />
            </DialogClose>
          </div>

          {step === "send" ? (
            <>
              <p className="m-0 font-normal text-[14px] leading-[20px] text-[#626262]">
                We want to send a One-Time-Password to your registered email address to enable you change your password
              </p>
              {error ? <p className="mt-[12px] font-medium text-[13px] leading-[16px] text-[#b42318]">{error}</p> : null}
              <div className="mt-[24px] flex items-center justify-end gap-[16px]">
                <button type="button" className="cursor-pointer border-0 bg-transparent p-0 font-medium text-[14px] text-[#626262]" onClick={closeDialog}>
                  Cancel
                </button>
                <CtaButton type="button" disabled={pending} className="h-[40px] px-[22px] text-[14px]" onClick={() => void sendOtp()}>
                  Proceed
                </CtaButton>
              </div>
            </>
          ) : null}

          {step === "otp" ? (
            <>
              <p className="m-0 font-medium text-[14px] leading-[17px] text-[#14181b]">Verify OTP</p>
              <p className="mt-[6px] font-normal text-[13px] leading-[18px] text-[#626262]">
                We have sent an 8 digit code to {maskEmail(email)}
              </p>
              <div className="mt-[16px] flex justify-between gap-[8px]">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(node) => { otpRefs.current[index] = node; }}
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    autoFocus={index === 0}
                    maxLength={OTP_LENGTH}
                    value={digit}
                    aria-label={`Digit ${index + 1}`}
                    className="h-[44px] w-full rounded-[8px] border border-solid border-[#e4e8eb] bg-[#f8f8f8] text-center font-medium text-[16px] text-[#14181b] outline-none"
                    onChange={(event) => {
                      const digits = event.target.value.replace(/\D/g, "");
                      if (digits.length > 1) {
                        fillOtp(digits, index);
                        return;
                      }
                      const next = digits.slice(-1);
                      setCode((current) => current.map((item, itemIndex) => (itemIndex === index ? next : item)));
                      if (next && otpRefs.current[index + 1]) otpRefs.current[index + 1]?.focus();
                    }}
                    onPaste={(event) => {
                      const text = event.clipboardData.getData("text");
                      if (!/\d/.test(text)) return;
                      event.preventDefault();
                      fillOtp(text, index);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Backspace" && !code[index] && otpRefs.current[index - 1]) {
                        otpRefs.current[index - 1]?.focus();
                      }
                    }}
                  />
                ))}
              </div>
              <div className="mt-[12px] flex items-center justify-between gap-3">
                {otpNotice && !error ? (
                  <p className="m-0 font-medium text-[13px] leading-[16px] text-[#048bdc]">{otpNotice}</p>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  disabled={pending || resendIn > 0}
                  className="cursor-pointer border-0 bg-transparent p-0 font-medium text-[13px] leading-[16px] text-[#296cf0] disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => {
                    if (pending || resendIn > 0) return;
                    setCode(emptyOtp());
                    setOtpNotice(null);
                    otpRefs.current[0]?.focus();
                    void sendOtp(true);
                  }}
                >
                  {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
                </button>
              </div>
              {error ? <p className="mt-[12px] font-medium text-[13px] leading-[16px] text-[#b42318]">{error}</p> : null}
              <CtaButton
                type="button"
                className="mt-[20px] h-[48px] w-full"
                onClick={() => {
                  if (code.join("").length !== OTP_LENGTH) {
                    setError(`Enter the ${OTP_LENGTH} digit code from your email.`);
                    return;
                  }
                  setError(null);
                  setStep("password");
                }}
              >
                Continue
              </CtaButton>
            </>
          ) : null}

          {step === "password" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void savePassword();
              }}
            >
              <PasswordField
                label="New password"
                placeholder="Enter new password"
                value={password}
                shown={showPassword}
                onChange={setPassword}
                onToggle={() => setShowPassword((value) => !value)}
              />
              <div className="mt-[16px]">
                <PasswordField
                  label="Confirm password"
                  placeholder="Confirm password"
                  value={confirm}
                  shown={showConfirm}
                  onChange={setConfirm}
                  onToggle={() => setShowConfirm((value) => !value)}
                />
              </div>
              {error ? <p className="mt-[12px] font-medium text-[13px] leading-[16px] text-[#b42318]">{error}</p> : null}
              <CtaButton type="submit" disabled={pending} className="mt-[20px] h-[48px] w-full">
                Change password
              </CtaButton>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "cursor-pointer border-0 border-b-2 border-solid bg-transparent px-0 pb-[8px] font-medium text-[14px] leading-[17px]",
        active ? "border-[#296cf0] text-[#296cf0]" : "border-transparent text-[#a5a5a5]",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ReadOnlyField({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <label className="flex flex-col gap-[8px]">
      <span className="font-medium text-[14px] leading-[17px] text-[#14181b]">{label}</span>
      <span className="relative block">
        <input
          readOnly
          value={value}
          className="h-[48px] w-full rounded-[8px] border border-solid border-[#e4e8eb] bg-white px-[16px] pr-[40px] font-normal text-[14px] leading-[normal] text-[#14181b] outline-none"
        />
        <span className="pointer-events-none absolute top-1/2 right-[12px] -translate-y-1/2">{icon}</span>
      </span>
    </label>
  );
}

function AddressRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-[16px]">
      <p className="font-normal text-[13px] leading-[16px] text-[#a5a5a5]">{label}</p>
      <p className="max-w-[220px] text-right font-medium text-[13px] leading-[16px] text-[#14181b]">{value}</p>
    </div>
  );
}

function PasswordField({
  label,
  placeholder,
  value,
  shown,
  onChange,
  onToggle,
}: {
  label: string;
  placeholder: string;
  value: string;
  shown: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <label className="flex flex-col gap-[8px]">
      <span className="font-medium text-[14px] leading-[17px] text-[#14181b]">{label}</span>
      <span className="relative block">
        <input
          type={shown ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          autoComplete="new-password"
          onChange={(event) => onChange(event.target.value)}
          className="h-[48px] w-full rounded-[8px] border border-solid border-[#e4e8eb] bg-white px-[16px] pr-[40px] font-normal text-[14px] text-[#14181b] outline-none placeholder:text-[#a5a5a5]"
        />
        <button
          type="button"
          aria-label={shown ? "Hide password" : "Show password"}
          className="absolute top-1/2 right-[12px] -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0 text-[#a5a5a5]"
          onClick={onToggle}
        >
          <UnlockIcon size={18} color="#a5a5a5" />
        </button>
      </span>
    </label>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(6, local.length - 2))}@${domain}`;
}
