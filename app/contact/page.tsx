import { connection } from "next/server";
import Image from "next/image";
import { Suspense } from "react";
import { EnquiryForm } from "@/components/contact/enquiry-form";
import { CallCallingIcon, LocationIcon } from "@/components/icons";
import { Footer } from "@/components/landing/footer";
import { HeaderNav } from "@/components/landing/header-nav";
import { createClient } from "@/lib/supabase/server";

async function SignedInEnquiryForm() {
  await connection();
  let name = "";
  let email = "";
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle();
      name = String(profile?.full_name ?? user.user_metadata?.full_name ?? "").trim();
      email = String(profile?.email ?? user.email ?? "").trim();
    }
  } catch {
    name = "";
    email = "";
  }
  return <EnquiryForm defaultName={name} defaultEmail={email} />;
}

export default function ContactPage() {
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
          <Suspense fallback={<EnquiryForm />}>
            <SignedInEnquiryForm />
          </Suspense>
        </div>
      </section>
      <div className="hidden h-[47px] w-full bg-[#fdfdfd] desk:block" />
      <Footer />
    </div>
  );
}
