import { BookCover } from "@/components/landing/book-cover";

const defaultParagraphs = [
  "The author is a passionate storyteller whose work is rooted in the belief that every experience carries a story worth telling. With a deep appreciation for human connection, personal growth, and the complexity of everyday life, their writing explores the moments that shape us and the choices that define who we become.",
  "Writing has always been more than putting words on a page. For the author, it is a way of observing the world, asking difficult questions, exploring different perspectives, and creating something that readers can see themselves in. Their approach to storytelling combines honesty, emotion, imagination, and a strong understanding of the human experience.",
  "Through this book, the author invites readers into a world built around meaningful experiences, compelling ideas, and authentic emotion. Each chapter is an opportunity to pause, reflect, and discover something new—whether about the characters, the circumstances they encounter, or perhaps even about themselves.",
];

export function AboutBook({
  designCover = null,
  paragraphs = null,
}: {
  designCover?: string | null;
  paragraphs?: string[] | null;
}) {
  const copy = paragraphs?.length ? paragraphs : defaultParagraphs;
  return (
    <section
      id="about-book"
      className="relative w-full shrink-0 overflow-hidden bg-white px-5 py-10 desk:h-[464px] desk:overflow-clip desk:px-0 desk:py-0"
    >
      <div className="mx-auto flex w-full max-w-[959px] flex-col items-start gap-5 desk:absolute desk:top-[calc(50%+0.5px)] desk:left-[calc(50%+0.33px)] desk:w-[958.656px] desk:-translate-x-1/2 desk:-translate-y-1/2 desk:gap-[20px]">
        <h2 className="m-0 w-full font-normal text-[24px] leading-[1.22] text-[#242428] desk:text-[32px]">
          About this book
        </h2>
        <div className="flex w-full flex-col items-center justify-center desk:h-[288px] desk:items-end">
          <div className="flex w-full flex-col-reverse items-center gap-6 md:flex-row md:justify-center desk:gap-[66px]">
            <div className="w-full font-normal text-[15px] text-[#626262] desk:w-[707px] desk:text-[16px]">
              {copy.map((paragraph, index) => (
                <p
                  key={`${index}-${paragraph.slice(0, 24)}`}
                  className={index === copy.length - 1 ? "leading-[24px]" : "mb-0 leading-[24px]"}
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <BookCover src={designCover} width={185.313} height={258} alt="Design cover" className="shrink-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
