import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import PWAListener from "@/components/PWAListener";


export const metadata: Metadata = {
  title: "QuartierSecure",
  description: "Renforcez les liens sociaux et la sécurité de votre environnement.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <FirebaseClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <PWAListener />
            {children}
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
