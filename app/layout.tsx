import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { SITE_CONFIG } from "../lib/constants"
import { ThemeProvider } from "next-themes"
import FloatingControls from "../components/FloatingControls"
import Footer from "../components/Footer"

const caskaydia = localFont({
  src: [
    { path: "../public/fonts/CaskaydiaMonoNerdFont-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/CaskaydiaMonoNerdFont-Bold.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-caskaydia",
})

const spaceGrotesk = localFont({
  src: [
    { path: "../public/fonts/SpaceGrotesk-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/SpaceGrotesk-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/SpaceGrotesk-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/SpaceGrotesk-Bold.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.siteUrl),
  title: SITE_CONFIG.siteTitle,
  description: SITE_CONFIG.siteDescription,
  icons: { icon: "/favicon.svg" },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang={SITE_CONFIG.lang}
      suppressHydrationWarning
      className={`${caskaydia.variable} ${spaceGrotesk.variable}`}
    >
      <body className="antialiased bg-white dark:bg-zinc-950 text-gray-900 dark:text-white transition-colors duration-300 min-h-screen flex flex-col relative overflow-x-hidden font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FloatingControls />

          <main className="w-full grow pb-16">{children}</main>

          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
