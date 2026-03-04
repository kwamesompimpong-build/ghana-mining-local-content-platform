import type { Metadata } from "next";
import { SessionProvider } from "@/providers/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ghana Mining Local Content Platform",
  description:
    "Digital compliance tracking and supplier management platform for Ghana's mining sector — aligned with L.I. 2431",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
