"use client";

import Image from "next/image";
import {
  CallCallingIcon,
  DocumentTextIcon,
  LocationIcon,
  MessageTextIcon,
  SmsIcon,
  UserIcon,
} from "@/components/icons";
import { Footer } from "@/components/landing/footer";
import { HeaderNav } from "@/components/landing/header-nav";
import { useState } from "react";
import { submitEnquiry } from "@/app/actions/enquiries";
import { CtaButton } from "@/components/landing/cta-button";
import { InputField, TextAreaField } from "@/components/ui/input-field";

export default function ContactPage() {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <div className="relative mx-auto w-full max-w-[1440px] bg-[#fdfdfd]">
      <section className="relative w-full overflow-x-clip desk:h-[1090px] desk:overflow-clip">
        <HeaderNav />
        <div className="flex w-full flex-col items-center gap-4 px-5 pt-8 text-center desk:absolute desk:top-[156px] desk:left-[265.5px] desk:w-[909px] desk:gap-[16px] desk:px-0 desk:pt-0">
          <h1 className="relative m-0 inline-block font-semibold text-[32px] leading-[100%] text-[#242428] desk:text-[38px]">
            Contact Us
            <Image
              src="/images/contact-shine.png"
              alt=""
              width={36}
              height={35}
              quality={100}
              className="pointer-events-none absolute top-[-8px] left-[calc(100%-18px)] h-[28px] w-[29px] desk:top-[-12px] desk:left-[calc(100%-16px)] desk:h-[35px] desk:w-[36px]"
            />
          </h1>
          <p className="w-full max-w-[909px] font-normal text-[15px] leading-[142%] text-[#637A87] desk:w-[909px] desk:text-[16px]">
            Our goal is to provide you with the best possible support and
            assistance. Don&apos;t hesitate to reach out with any questions or
            concerns
          </p>
        </div>
        <div className="flex w-full flex-col items-stretch gap-8 px-5 pt-8 pb-12 desk:absolute desk:top-[304px] desk:left-[276px] desk:h-[691px] desk:w-[906px] desk:flex-row desk:items-start desk:gap-[30px] desk:px-0 desk:pt-0 desk:pb-0">
          <div className="relative h-[320px] w-full overflow-clip rounded-[24px] bg-[#296cf0] sm:h-[364px] desk:h-[364px] desk:w-[415px] desk:shrink-0">
            <Image
              src="/images/reach-us-bg.png"
              alt=""
              width={575}
              height={397}
              quality={100}
              className="pointer-events-none absolute max-w-none"
              style={{ left: -113, top: -3, width: 575, height: 397 }}
            />
            <div className="relative z-[1] flex h-full flex-col px-6 pt-8 sm:pt-[41px] sm:pr-[59px] sm:pl-[59px]">
              <p className="font-bold text-[24px] leading-[100%] text-[#FBFCFC] desk:text-[28px]">
                Reach us via
              </p>
              <p className="mt-[1px] font-bold text-[15px] leading-[100%] text-[#FBFCFC] desk:text-center desk:text-[16px]">
                You can also reach us via these platforms
              </p>
              <div className="mt-8 flex flex-col gap-5 desk:mt-[40px] desk:gap-[20px]">
                <div className="flex items-start gap-[4px]">
                  <LocationIcon size={24} color="#FBFCFC" className="shrink-0" />
                  <div className="flex min-w-0 flex-col gap-[4px] desk:w-[268px]">
                    <p className="font-bold text-[20px] leading-[100%] text-[#FBFCFC]">
                      Office
                    </p>
                    <p className="font-normal text-[16px] leading-[19px] text-[#FBFCFC]">
                      Come say hello to us at Jabi lake mall, Abuja Nigeria
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-[4px]">
                  <CallCallingIcon
                    size={24}
                    color="#FFFFFF"
                    className="shrink-0"
                  />
                  <div className="flex min-w-0 flex-col gap-[4px] desk:w-[268px]">
                    <p className="font-bold text-[20px] leading-[100%] text-[#FBFCFC]">
                      Call
                    </p>
                    <p className="font-normal text-[16px] leading-[19px] text-[#FBFCFC]">
                      081324242252
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <form
            className="flex w-full flex-col desk:w-[461px] desk:shrink-0"
            onSubmit={async (event) => {
              event.preventDefault();
              setPending(true);
              setError(null);
              setNotice(null);
              const result = await submitEnquiry(new FormData(event.currentTarget));
              setPending(false);
              if (result.error) setError(result.error);
              if (result.message) {
                setNotice(result.message);
                event.currentTarget.reset();
              }
            }}
          >
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
              {notice ? (
                <p className="font-medium text-[14px] leading-[18px] text-[#048bdc]">{notice}</p>
              ) : null}
              <CtaButton type="submit" disabled={pending} className="h-[56px] w-full">
                Submit
              </CtaButton>
            </div>
          </form>
        </div>
      </section>
      <div className="hidden h-[47px] w-full bg-[#fdfdfd] desk:block" />
      <Footer />
    </div>
  );
}
