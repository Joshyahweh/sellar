import Image from "next/image";

type BookCoverProps = {
  width: number;
  height: number;
  className?: string;
  alt?: string;
  src?: string | null;
};

export function BookCover({
  width,
  height,
  className,
  alt = "Sacred But Fully Known book cover",
  src,
}: BookCoverProps) {
  return (
    <div
      className={className}
      style={{ width, height, position: "relative", overflow: "hidden" }}
    >
      {src ? (
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-contain" />
      ) : (
        <Image
          src="/images/book-cover.png"
          alt={alt}
          width={720}
          height={1080}
          className="absolute top-[-9.93%] left-[-0.22%] h-[112.85%] w-[104.74%] max-w-none"
          quality={100}
        />
      )}
    </div>
  );
}
