import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaPay Merchant Portal",
  description: "Accept payments and manage your business",
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
