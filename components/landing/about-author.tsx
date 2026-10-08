import Image from "next/image";

export function AboutAuthor() {
  return (
    <section
      id="about-author"
      className="relative w-full shrink-0 overflow-hidden bg-[#011b2a] px-5 py-10 desk:h-[592px] desk:w-full desk:overflow-clip desk:px-0 desk:py-0"
    >
      <div className="mx-auto flex w-full max-w-[1059px] flex-col items-start desk:absolute desk:top-1/2 desk:left-[189.5px] desk:w-[1059.098px] desk:-translate-y-1/2">
        <div className="flex w-full flex-col-reverse items-center gap-6 md:flex-row md:items-start md:justify-center desk:gap-[20px]">
          <div className="flex flex-col items-start desk:h-[457px] desk:shrink-0">
            <div className="w-full font-normal text-[15px] text-white desk:w-[707px] desk:text-[16px]">
              <p className="mb-0 leading-[24px]">
                The author is a passionate storyteller whose work is rooted in
                the belief that every experience carries a story worth telling.
                With a deep appreciation for human connection, personal growth,
                and the complexity of everyday life, their writing explores the
                moments that shape us and the choices that define who we become.
              </p>
              <p className="mb-0 leading-[24px]">
                Writing has always been more than putting words on a page. For
                the author, it is a way of observing the world, asking difficult
                questions, exploring different perspectives, and creating
                something that readers can see themselves in. Their approach to
                storytelling combines honesty, emotion, imagination, and a
                strong understanding of the human experience.
              </p>
              <p className="mb-0 leading-[24px]">
                Through this book, the author invites readers into a world built
                around meaningful experiences, compelling ideas, and authentic
                emotion. Each chapter is an opportunity to pause, reflect, and
                discover something new—whether about the characters, the
                circumstances they encounter, or perhaps even about themselves.
              </p>
              <p className="mb-0 leading-[24px]">
                The author hopes their work does more than entertain. They want
                their stories to start conversations, challenge perspectives,
                inspire reflection, and remain with readers long after the final
                page.
              </p>
              <p className="leading-[24px]">
                When not writing, the author enjoys discovering new ideas,
                reading, observing people and the world around them, and finding
                inspiration in ordinary moments. They continue to write with the
                hope that every story they tell will connect with someone,
                somewhere, in a meaningful way.
              </p>
            </div>
          </div>
          <div className="relative h-[360px] w-full max-w-[330px] shrink-0 overflow-clip desk:h-[439px] desk:w-[329.598px]">
            <Image
              src="/images/author.jpg"
              alt="Funke Allen"
              fill
              sizes="330px"
              quality={100}
              className="object-cover"
            />
            <div className="absolute top-[280px] left-1/2 flex -translate-x-1/2 items-center justify-center overflow-clip bg-[rgba(255,255,255,0.42)] px-10 py-4 desk:top-[359px] desk:left-[calc(50%+0.2px)] desk:px-[100px] desk:py-[20px]">
              <p className="font-semibold text-[18px] leading-[normal] whitespace-nowrap text-[#296cf0]">
                Funke Allen
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
