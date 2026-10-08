"use client";

import { useState } from "react";
import { submitEnquiry } from "@/app/actions/enquiries";
import {
  DocumentTextIcon,
  MessageTextIcon,
  SmsIcon,
  UserIcon,
} from "@/components/icons";
import { CtaButton } from "@/components/landing/cta-button";
import { InputField, TextAreaField } from "@/components/ui/input-field";
import { SuccessDialog } from "@/components/ui/success-dialog";

export function EnquiryForm({
  defaultName = "",
  defaultEmail = "",
}: {
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex w-full flex-col desk:w-[461px] desk:shrink-0"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        setPending(true);
        setError(null);
        setNotice(null);
        const result = await submitEnquiry(new FormData(form));
        setPending(false);
        if (result.error) setError(result.error);
        if (result.message) {
          form.reset();
          setNotice(result.message);
        }
      }}
    >
      <SuccessDialog
        open={Boolean(notice)}
        title="Message sent"
        message={notice ?? "Your enquiry has been sent. We will get back to you soon."}
        onClose={() => setNotice(null)}
      />
      <div className="flex flex-col gap-[8px] desk:h-[88px]">
        <h2 className="m-0 font-semibold text-[24px] leading-[100%] text-[#242428] desk:text-[28px]">
          Enquiry Form
        </h2>
        <p className="font-normal text-[15px] leading-[142%] text-[#A5A5A5] desk:text-[16px]">
          Kindly fill this form with the correct details and we would get
          back to you as soon as possible.
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-6 desk:mt-[24px] desk:gap-[24px]">
        <InputField
          label="Full Name"
          name="name"
          placeholder="Enter your full name"
          defaultValue={defaultName}
          autoComplete="name"
          icon={<UserIcon size={20} />}
        />
        <InputField
          label="Email Address"
          name="email"
          type="email"
          placeholder="Enter your email address"
          defaultValue={defaultEmail}
          autoComplete="email"
          icon={<SmsIcon size={20} />}
        />
        <InputField
          label="Subject"
          name="subject"
          placeholder="Enter the subject of your message"
          icon={<DocumentTextIcon size={20} />}
        />
        <TextAreaField
          label="Message"
          name="message"
          placeholder="Enter your message"
          icon={<MessageTextIcon size={20} />}
        />
        {error ? (
          <p className="font-medium text-[14px] leading-[18px] text-[#b42318]">{error}</p>
        ) : null}
        <CtaButton type="submit" disabled={pending} className="h-[56px] w-full">
          Submit
        </CtaButton>
      </div>
    </form>
  );
}
