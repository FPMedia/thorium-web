import type { Metadata } from "next";
import { Poppins, Roboto, Roboto_Mono, Mrs_Saint_Delafield } from "next/font/google";

import { ThStoreProvider } from "@/lib/ThStoreProvider";
import { ThPreferencesProvider } from "@/preferences/ThPreferencesProvider";
import { ThI18nProvider } from "@/i18n/ThI18nProvider";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { ErrorHandler } from "./ErrorHandler";
import "./app.css";

// Font configurations
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-roboto",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto-mono",
  display: "swap",
});

const mrsSaintDelafield = Mrs_Saint_Delafield({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mrs-saint-delafield",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nicole Barlow - Books",
  description: "eReader for books by Nicole Barlow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${roboto.variable} ${robotoMono.variable} ${mrsSaintDelafield.variable}`}
      >
        <ErrorHandler />
        <ThStoreProvider>
          <ThPreferencesProvider>
            <ThI18nProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ThI18nProvider>
          </ThPreferencesProvider>
        </ThStoreProvider>
      </body>
    </html>
  );
}
