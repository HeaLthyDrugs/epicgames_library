import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { LibraryProvider } from "./context/LibraryContext";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "Epic Games Store | Download & Play PC Games, Mods, DLC & More - Epic Games",
  description: "A clone of the Epic Games Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} font-roboto antialiased`}
      >
        <LibraryProvider>
          {children}
        </LibraryProvider>
      </body>
    </html>
  );
}
