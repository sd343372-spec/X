import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ComputeX — Community-Powered GPU Computing",
  description:
    "ComputeX is being built to connect people who need GPU computing with people who have compatible GPU capacity to share. Discover the concept and see how both sides could participate.",
  openGraph: {
    title: "ComputeX — Community-Powered GPU Computing",
    description:
      "A distributed GPU-computing marketplace connecting AI developers with GPU providers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        {children}
      </body>
    </html>
  );
}
