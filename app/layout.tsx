import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
});

export const metadata: Metadata = {
  title: "Sacred But Fully Known",
  description:
    "A deeply personal journey of faith, identity and personal discovering what it means to be fully known by God. A book by Funke Allen.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${urbanist.variable} ${urbanist.className} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-[#fdfdfd] font-sans">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
