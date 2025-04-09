import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import AdSense from "@/components/AdSense";
export const metadata: Metadata = {
  title: "JSON to TypeScript",
  description: "json-to-ts",
  generator: "json-to-ts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <AdSense pId="6477167181117418" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6477167181117418"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
