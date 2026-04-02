import type { Metadata } from "next";
import { Ovo } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const legan = localFont({
  src: "./fonts/Legan.woff",
  variable: "--font-legan",
  weight: "100 900",
});

const thesignature = localFont({
  src: "./fonts/Thesignature.ttf",
  variable: "--font-thesignature",
  weight: "100 900",
});

const wonder = localFont({
  src: "./fonts/Wonder.woff",
  variable: "--font-wonder",
  weight: "100 900",
});

const ovo = Ovo({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ovo",
});


export const metadata: Metadata = {
  title: "Buna House Opening Event",
  description: "Admin-managed coffee house opening event website.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`bg-[#0a0a0a] ${ovo.variable} ${thesignature.variable} ${wonder.variable} ${legan.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
