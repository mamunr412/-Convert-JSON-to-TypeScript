import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
