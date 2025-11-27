import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ThStoreProvider } from "@/lib/ThStoreProvider";
import { ThPreferencesProvider } from "@/preferences/ThPreferencesProvider";
import { ThI18nProvider } from "@/i18n/ThI18nProvider";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={ inter.className }>
        <ThStoreProvider>
          <ThPreferencesProvider>
            <ThI18nProvider>
              { children }
            </ThI18nProvider>
          </ThPreferencesProvider>
        </ThStoreProvider>
      </body>
    </html>
  );
}
