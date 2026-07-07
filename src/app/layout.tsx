import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Himnario Unión Pentecostal — Cancionero Cristiano Evangélico",
    template: "%s · Himnario Unión Pentecostal",
  },
  description:
    "Biblioteca digital de himnos, coritos y alabanzas de la iglesia Unión Pentecostal: letras, acordes, transposición de tonalidad, favoritos y modo nocturno.",
  keywords: ["himnario", "cancionero cristiano", "himnos evangélicos", "alabanza", "acordes", "iglesia"],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "es_ES",
    title: "Himnario Unión Pentecostal",
    description: "Himnos, coritos y alabanzas con letra y acordes para nuestra congregación.",
    siteName: "Himnario Unión Pentecostal",
  },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Himnario UP" },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1a30",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Fuentes: serif elegante para títulos, sans legible para letra y UI */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        {/* Restaura el modo nocturno antes del primer render para evitar parpadeo */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var p=JSON.parse(localStorage.getItem("himnario:preferencias")||"{}");if(p.night)document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <PwaRegister />
      </body>
    </html>
  );
}
