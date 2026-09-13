import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THE DEED HOSTELS | Smart Hostel Management",
  description: "Professional rental and hostel management platform for THE DEED HOSTELS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
