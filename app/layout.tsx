import "@/styles/globals.css";

import { fontHeading, fontSans, fontUrban } from "@/assets/fonts";
import { PHProvider } from '@/components/providers';
import { ModalProvider } from "@/components/modal-provider";
import { ThemeProvider } from "@/components/providers";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";

interface RootLayoutProps {
  children: React.ReactNode
}
export const metadata = {
  title: {
    default: 'AskGit',
    template: `%s | ''`,
  },
  description: "Lorem ipsum",
  keywords: [
    "Next.js",
    "React",
    "Prisma",
    "PlanetScale",
    "Auth.js",
    "shadcn ui",
    "Resend",
    "React Email",
    "Stripe"
  ],
  authors: [
    {
      name: "mickasmt",
    },
  ],
  creator: "mickasmt",
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontUrban.variable,
          fontHeading.variable
        )}
        style={{
          overflow: 'hidden',
          height: '100vh'
        }}
      >
        <PHProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
            <ModalProvider />
            <TailwindIndicator />
          </ThemeProvider>
        </PHProvider>
      </body>
    </html>
  )
}
