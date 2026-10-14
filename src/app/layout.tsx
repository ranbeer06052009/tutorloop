import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "TutorLoop — close the session, get paid",
  description:
    "Local Gemma turns messy tutoring notes into a parent recap, homework, and invoice. MongoDB Atlas stores the ledger. Render hosts the desk.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} ${fraunces.variable} antialiased ledger-bg`}>
        {children}
      </body>
    </html>
  );
}
