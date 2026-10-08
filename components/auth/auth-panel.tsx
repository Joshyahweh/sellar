import Image from "next/image";
import { BookCover } from "@/components/landing/book-cover";

export function AuthPanel() {
  return (
    <div className="relative hidden h-[848px] w-[661px] shrink-0 overflow-clip desk:block">
      <Image
        src="/images/hero-bg.jpg"
        alt=""
        fill
        sizes="661px"
        quality={100}
        className="object-cover"
      />
      <p className="absolute top-[144px] left-[262px] font-semibold text-[24px] leading-[29px] text-white">
        Get our book
      </p>
      <div className="absolute top-[182px] left-[145px] h-[483px] w-[371px] bg-[rgba(255,255,255,0.62)]">
        <p className="absolute top-[231px] left-[142px] font-normal text-[18px] leading-[22px] text-black">
          Front cover
        </p>
        <BookCover
          width={185.313}
          height={258}
          className="absolute top-[113px] left-[93px]"
        />
      </div>
    </div>
  );
}
