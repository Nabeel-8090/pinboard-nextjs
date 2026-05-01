import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import NavbarWrapper from "./components/NavbarWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PinBoard",
  description: "A visual content sharing app for discovering and saving ideas",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Providers>
          {/* NavbarWrapper is a client component that handles hiding on auth pages */}
          <NavbarWrapper />

          <main className="flex-1">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}